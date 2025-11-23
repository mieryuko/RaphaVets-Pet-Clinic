import db from "../../config/db.js";

export const assignAppointment = async (req, res) => {
  try {
    const { userID, petID, serviceID, date, time } = req.body;

    console.log(`Parsed data: `, {
      userID,
      petID,
      serviceID,
      date,
      time,
    });

    const missingFields = [];
    if (!petID) missingFields.push("petID");
    if (!serviceID) missingFields.push("serviceID");
    if (!date) missingFields.push("date");
    if (!time) missingFields.push("time");

    if (missingFields.length > 0) {
      console.log("❌ Missing fields:", missingFields);
      return res.status(400).json({
        message: "Missing required fields",
        missingFields,
      });
    }

    const convertTo24Hour = (timeStr) => {
      let [time, modifier] = timeStr.split(" ");
      let [hour, minutes] = time.split(":");

      hour = (hour % 12) + (modifier === "PM" ? 12 : 0);
      return `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:00`;
    };

    const dbTimeFormat = convertTo24Hour(time);

    console.log("24Hour Time: ", dbTimeFormat);

    const [timeRow] = await db.execute(
      `
         SELECT
            scheduledTimeID
         FROM scheduletime_tbl
         WHERE scheduleTime = ?
      `,
      [dbTimeFormat]
    );

    console.log("TimeRow extracted: ", timeRow);

    if (timeRow.length === 0) {
      return res.status(400).json({
        message: "Invalid time slot",
        details: `Time '${time}' not found in available slots`,
      });
    }

    const scheduledTimeID = timeRow[0].scheduledTimeID;
    console.log("Time ID:", scheduledTimeID);

    const [result] = await db.execute(
      `
         INSERT INTO appointment_tbl
            (accID,
            petID,
            serviceID,
            appointmentDate,
            scheduledTimeID,
            visitType,
            statusID)
         VALUES (?, ?, ?, ?, ?, "Scheduled", 2)
      `,
      [userID, petID, serviceID, date, scheduledTimeID]
    );

    res.status(201).json({
      message: "Appointment booked successfully",
      appointmentId: result.insertId,
    });
  } catch (err) {
    console.error("Error assigning appointment: ", err);
    res.status(500).json({
      message: "Server error: ",
      error: err,
    });
  }
};
export const getAppointmentAndVisits = async (req, res) => {
  try {
    const [appointments] = await db.execute(`
         SELECT
            a.*,
            p.petName,
            CONCAT(ac.firstName, ' ', ac.lastName) as ownerName,
            sc.scheduleTime,
            s.statusName
         FROM appointment_tbl a
         JOIN appointment_status_tbl s ON s.statusID = a.statusID
         JOIN pet_tbl p ON p.petID = a.petID
         JOIN account_tbl ac ON ac.accID = a.accID
         JOIN scheduletime_tbl sc on sc.scheduledTimeID = a.scheduledTimeID
         WHERE a.visitType = "Scheduled"
            AND a.visitDateTime IS NULL
            AND a.isDeleted = FALSE
         ORDER BY a.appointmentDate ASC, a.scheduledTimeID ASC
         `);

    const [visits] = await db.execute(`
         SELECT
            a.*,
            p.petName,
            CONCAT(ac.firstName, ' ', ac.lastName) as ownerName,
            s.statusName
         FROM appointment_tbl a
         JOIN appointment_status_tbl s ON s.statusID = a.statusID
         JOIN pet_tbl p ON p.petID = a.petID
         JOIN account_tbl ac ON ac.accID = a.accID
         LEFT JOIN scheduletime_tbl st on st.scheduledTimeID = a.scheduledTimeID
         WHERE visitDateTime IS NOT NULL
            AND a.isDeleted = FALSE
         ORDER BY visitDateTime ASC
        `);

    const cleanedAppointments = appointments.map((apt) => ({
      id: apt.appointmentID,
      petName: apt.petName,
      owner: apt.ownerName,
      date: new Date(apt.appointmentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }),
      time: new Date(`1970-01-01T${apt.scheduleTime}`).toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      ),
      status: apt.statusName,
      visitType: apt.visitType,
    }));

    const cleanedVisits = visits.map((vst) => ({
      id: vst.appointmentID,
      petName: vst.petName,
      owner: vst.ownerName,
      date: new Date(vst.visitDateTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }),
      time: new Date(vst.visitDateTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      visitType: vst.visitType,
      status: vst.status,
    }));

    res.status(200).json({ cleanedAppointments, cleanedVisits });
  } catch (err) {
    console.error("DB error: ", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

export const updateStatus = async (req, res) => {
  const { status, idsToUpdate } = req.body;

  let ids = Array.isArray(idsToUpdate) ? idsToUpdate : [idsToUpdate];
  console.log("IDs raw: ", ids);
  ids = ids.filter((id) => id !== undefined && id !== null);
  console.log("IDs filtered: ", ids);
  if (ids.length === 0) {
    console.log("Twink");
    return res.status(400).json({ message: "No IDs provided for update" });
  }
  try {
    console.log(status);
    const [statusRow] = await db.execute(
      `
         SELECT statusID from appointment_status_tbl
         WHERE statusName = ?
         LIMIT 1;
      `,
      [status]
    );

    if (statusRow.length === 0)
      return res.status(404).json({ message: "Status not found" });

    const statusID = statusRow[0].statusID;

    const placeholder = ids.map(() => "?").join(",");

    await db.execute(
      `
         UPDATE appointment_tbl
         SET statusID = ?
         WHERE appointmentID IN (${placeholder})
      `,
      [statusID, ...ids]
    );
    res
      .status(200)
      .json({ message: "Successfully updated appointment status" });
  } catch (err) {
    console.error("DB error in update status: ", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

export const deleteAppointment = async (req, res) => {
  const { idsToDelete } = req.body;

  let ids = Array.isArray(idsToDelete) ? idsToDelete : [idsToDelete];

  console.log("Ids to delete: ", idsToDelete);

  ids = ids.filter((id) => id !== undefined && id !== null);

  if (ids.length === 0)
    return res.status(400).json({ message: "No IDs provided." });

  try {
    const placeholder = ids.map(() => "?").join(",");

    await db.execute(
      `
         UPDATE appointment_tbl
         SET isDeleted = TRUE
         WHERE appointmentID IN (${placeholder})
      `,
      [...ids]
    );

    res.status(200).json({ message: "Successfully deleted appointments." });
  } catch (err) {
    console.error(`DB error in deleting appointments: ${err}`);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
};
