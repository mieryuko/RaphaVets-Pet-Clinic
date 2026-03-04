import { fi } from "date-fns/locale";
import db from "../../config/db.js";
import { createAppointmentNotification } from "../notificationController.js"; // Import notification function



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
      [dbTimeFormat],
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
          statusID,
          isDeleted)
        VALUES (?, ?, ?, ?, ?, "Scheduled", 2, 0)
      `,
      [userID, petID, serviceID, date, scheduledTimeID],
    );

    const appointmentId = result.insertId;

    // 🔔 TRIGGER NOTIFICATION for new appointment (Upcoming status - ID 2)
    try {
      const notifReq = {
        body: {
          appointmentID: appointmentId,
          accID: userID,
          statusID: 2, // Upcoming status
          appointmentDate: date,
        },
        user: req.user,
      };

      const notifRes = {
        status: (code) => ({
          json: (data) => {
            console.log(`🔔 Notification response (${code}):`, data);
          },
        }),
      };

      await createAppointmentNotification(notifReq, notifRes);
      console.log("✅ Appointment notification sent to user:", userID);
    } catch (notifError) {
      console.error("⚠️ Failed to send appointment notification:", notifError);
    }

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointmentId: appointmentId,
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
            CONCAT(
                TIMESTAMPDIFF(YEAR, p.dateOfBirth, CURDATE()), 'y ',
                TIMESTAMPDIFF(MONTH, p.dateOfBirth, CURDATE()) % 12, 'm'
            ) AS petAge,
            p.petGender AS petSex,
            p.weight_kg AS weight,
            b.breedName,
            CONCAT(ac.firstName, ' ', ac.lastName) as ownerName,
            sc.scheduleTime,
            s.statusName,
            ac.email,
            sv.service,
            sv.description
         FROM appointment_tbl a
         JOIN appointment_status_tbl s ON s.statusID = a.statusID
         JOIN pet_tbl p ON p.petID = a.petID
         JOIN account_tbl ac ON ac.accID = a.accID
         JOIN scheduletime_tbl sc on sc.scheduledTimeID = a.scheduledTimeID
         JOIN service_tbl sv ON sv.serviceID = a.serviceID
         JOIN breed_tbl b ON b.breedID = p.breedID
         WHERE a.visitType = "Scheduled"
            AND a.isDeleted = FALSE
         ORDER BY a.appointmentDate DESC, a.scheduledTimeID DESC
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
         ORDER BY visitDateTime DESC
        `);

    const cleanedAppointments = appointments.map((apt) => ({
      id: apt.appointmentID,
      petName: apt.petName,
      petAge: apt.petAge,
      petSex: apt.petSex,
      weight: apt.weight,
      breedName: apt.breedName,
      owner: apt.ownerName,
      email: apt.email,
      date: apt.appointmentDate,
      time: new Date(`1970-01-01T${apt.scheduleTime}`).toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        },
      ),
      status: apt.statusName,
      visitType: apt.visitType,
      serviceType: apt.service,
      description: apt.description,
      accID: apt.accID, // Include for notification reference
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
      accID: vst.accID, // Include for notification reference
    }));

    return res.status(200).json({ cleanedAppointments, cleanedVisits });
  } catch (err) {
    console.error("DB error: ", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

export const getOwnerDetails = async (req, res) => {
  try {
    const [owners] = await db.execute(`
         SELECT
            a.*,
            c.contactNo
         FROM account_tbl a
         JOIN clientinfo_tbl c ON c.accID = a.accID
         WHERE a.isDeleted = FALSE
            AND a.roleID = 1
      `);

    if (owners.length === 0)
      return res.status(200).json({
        message: "No owners found",
        owners: [],
        pets: [],
        appointments: [],
      });

    const ownerIDs = owners.map((o) => o.accId);
    const ownersPlaceHolder = owners.map(() => "?").join(",");

    const [pets] = await db.execute(
      `
         SELECT
            p.*,
            CONCAT(
               TIMESTAMPDIFF(YEAR, p.dateOfBirth, CURDATE()),
               'y'
            ) AS age,
            b.species,
            b.breedName
         FROM pet_tbl p
         JOIN breed_tbl b ON b.breedID = p.breedID
         WHERE p.isDeleted = FALSE
            AND p.accID IN (${ownersPlaceHolder})
      `,
      ownerIDs,
    );

    const [appointments] = await db.execute(
      `
         SELECT
            a.*,
            DATE_FORMAT(a.appointmentDate, '%Y-%m-%d') AS date,
            p.petName,
            DATE_FORMAT(
               STR_TO_DATE(st.scheduleTime, '%H:%i:%s'), 
               '%l:%i %p') AS time,
            s.statusName,
            sv.service
         FROM appointment_tbl a
         JOIN pet_tbl p ON p.petID = a.petID
         JOIN appointment_status_tbl s ON s.statusID = a.statusID
         JOIN scheduletime_tbl st ON st.scheduledTimeID = a.scheduledTimeID
         JOIN service_tbl sv ON sv.serviceID = a.serviceID
         WHERE a.isDeleted = FALSE
            AND a.accID IN (${ownersPlaceHolder})
            AND statusName = "Upcoming"
      `,
      ownerIDs,
    );

    const cleanedOwners = owners.map((o) => ({
      id: o.accId,
      firstName: o.firstName,
      lastName: o.lastName,
      email: o.email,
      phone: o.contactNo,
    }));

    const cleanedPets = pets.map((p) => ({
      id: p.petID,
      userId: p.accID,
      name: p.petName,
      type: p.species,
      breed: p.breedName,
      age: p.age,
      sex: p.petGender,
      weight: p.weight_kg,
      color: p.color,
    }));

    const cleanedAppointments = appointments.map((a) => ({
      id: a.appointmentID,
      userId: a.accID,
      petId: a.petID,
      petName: a.petName,
      serviceType: a.service,
      date: a.date,
      time: a.time,
      status: a.statusName,
    }));

    return res.status(200).json({
      message: "Owner details fetched",
      owners: cleanedOwners,
      pets: cleanedPets,
      appointments: cleanedAppointments,
    });
  } catch (err) {
    console.error("Server Error: ", err);
  }
};

//
//Appoiments
// Additional methods for updating status, completing appointments, and deleting appointments would go here (as shown in the full code above)
//
export const updateStatus = async (req, res) => {
  const { status, idsToUpdate } = req.body;

  const connection = await db.getConnection();
  let ids = Array.isArray(idsToUpdate) ? idsToUpdate : [idsToUpdate];
  ids = ids.filter((id) => id !== undefined && id !== null);
  if (ids.length === 0)
    return res.status(400).json({ message: "No IDs provided for update" });

  try {
    await connection.beginTransaction();
    await console.log(status);
    const [statusRow] = await connection.execute(
      `
         SELECT statusID from appointment_status_tbl
         WHERE statusName = ?
         LIMIT 1;
      `,
      [status],
    );

    if (statusRow.length === 0)
      return res.status(404).json({ message: "Status not found" });

    const statusID = statusRow[0].statusID;

    const [terminalStatusRows] = await connection.execute(
      `SELECT statusID FROM appointment_status_tbl 
      WHERE statusName IN ('Completed', 'Cancelled', 'Rejected', 'Missed')`,
    );

    const terminalStatusIDs = terminalStatusRows.map((row) => row.statusID);

    const terminalPlaceholder = terminalStatusIDs.map(() => "?").join(",");

    const [editableAppointments] = await connection.execute(
      `SELECT appointmentID FROM appointment_tbl 
       WHERE appointmentID IN (${ids.map(() => "?").join(",")}) 
         AND statusID NOT IN (${terminalPlaceholder})`,
      [...ids, ...terminalStatusIDs],
    );
    const editableIDs = editableAppointments.map((app) => app.appointmentID);

    if (editableIDs.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Selected appointments cannot be updated due to their current status",
      });
    }

    const placeholder = editableIDs.map(() => "?").join(",");

    // Get appointment details before updating (for notifications)
    const [appointments] = await connection.execute(
      `SELECT appointmentID, accID, appointmentDate 
       FROM appointment_tbl 
       WHERE appointmentID IN (${placeholder})`,
      [...editableIDs],
    );

    await connection.execute(
      `
         UPDATE appointment_tbl
         SET statusID = ?
         WHERE appointmentID IN (${placeholder})
      `,
      [statusID, ...editableIDs],
    );

    if (status === "Completed") {
      completeAppointment(editableIDs, statusID, connection);
    } else {
      for (const apt of appointments) {
        try {
          const notifReq = {
            body: {
              appointmentID: apt.appointmentID,
              accID: apt.accID,
              statusID: statusID,
              appointmentDate: apt.appointmentDate,
            },
            user: req.user,
          };

          const notifRes = {
            status: (code) => ({
              json: (data) => {
                console.log(
                  `🔔 Notification for appointment ${apt.appointmentID}:`,
                  data,
                );
              },
            }),
          };

          await createAppointmentNotification(notifReq, notifRes);
          console.log(
            `✅ Notification sent for appointment ${apt.appointmentID}`,
          );
        } catch (notifError) {
          console.error(
            `⚠️ Failed to send notification for appointment ${apt.appointmentID}:`,
            notifError,
          );
        }
      }
    }
    await connection.commit();

    res
      .status(200)
      .json({ editedCount: editableIDs.length, message: "Successfully updated appointment status" });
  } catch (err) {
    console.error("DB error in update status: ", err);
    await connection.rollback();
    res.status(500).json({ error: "Server error: " + err.message });
  } finally {
    await connection.release();
  }
};

async function completeAppointment(ids, statusID, connection) {
  const placeholder = ids.map(() => "?").join(",");

  await connection.execute(
    `
      UPDATE appointment_tbl
      SET visitDateTime = NOW()
      WHERE appointmentID IN (${placeholder})
   `,
    [...ids],
  );

  // Get visit times for notifications
  const [appointments] = await connection.execute(
    `SELECT appointmentID, accID, appointmentDate,
         DATE_FORMAT(visitDateTime, '%l:%i %p') AS visitTime 
       FROM appointment_tbl 
       WHERE appointmentID IN (${placeholder})`,
    [...ids],
  );

  // 🔔 TRIGGER NOTIFICATION for completed appointment
  for (const apt of appointments) {
    try {
      const notifReq = {
        body: {
          appointmentID: apt.appointmentID,
          accID: apt.accID,
          statusID: statusID,
          appointmentDate: apt.appointmentDate,
          visitTime: apt.visitTime,
        },
        user: { id: apt.accID },
      };

      const notifRes = {
        status: (code) => ({
          json: (data) => {
            console.log(
              `🔔 Completion notification for appointment ${apt.appointmentID}:`,
              data,
            );
          },
        }),
      };

      await createAppointmentNotification(notifReq, notifRes);
      console.log(
        `✅ Completion notification sent for appointment ${apt.appointmentID}`,
      );
    } catch (notifError) {
      console.error(
        `⚠️ Failed to send completion notification for appointment ${apt.appointmentID}:`,
        notifError,
      );
    }
  }
}

export const deleteAppointment = async (req, res) => {
  const { idsToDelete } = req.body;

  let ids = Array.isArray(idsToDelete) ? idsToDelete : [idsToDelete];

  console.log("Ids to delete: ", idsToDelete);

  ids = ids.filter((id) => id !== undefined && id !== null);

  if (ids.length === 0)
    return res.status(400).json({ message: "No IDs provided." });

  try {
    const placeholder = ids.map(() => "?").join(",");

    // Get appointment details before deleting (for notification)
    const [appointments] = await db.execute(
      `SELECT appointmentID, accID, appointmentDate, statusID 
       FROM appointment_tbl 
       WHERE appointmentID IN (${placeholder})`,
      [...ids],
    );

    await db.execute(
      `
         UPDATE appointment_tbl
         SET isDeleted = TRUE
         WHERE appointmentID IN (${placeholder})
      `,
      [...ids],
    );

    return res
      .status(200)
      .json({ message: "Successfully deleted appointments." });
  } catch (err) {
    console.error(`DB error in deleting appointments: ${err}`);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
};

//
//Visits
//update visit info, create visit records
//
export const createVisit = async (req, res) => {
  console.log("Creating visit");
  try {
    const { userID, petID, serviceType } = req.body;

    if (!userID || !petID || !serviceType)
      return res.status(400).json({ message: "Missing required fields" });

    const [statusRow] = await db.execute(
      `
            SELECT statusID from appointment_status_tbl WHERE statusName = 'Completed' LIMIT 1;
         `,
    );
    if (statusRow.length === 0)
      return res.status(404).json({ message: "Status 'Completed' not found" });

    const completedStatusID = statusRow[0].statusID;

    const [serviceRow] = await db.execute(
      `
            SELECT serviceID FROM service_tbl WHERE service = ? LIMIT 1;
          `,
      [serviceType],
    );

    if (serviceRow.length === 0)
      return res
        .status(404)
        .json({ message: "Service ID not found for provided service type" });

    const serviceID = serviceRow[0].serviceID;

    const [visit] = await db.execute(
      `INSERT INTO appointment_tbl (accID, petID, serviceID, statusID, visitDateTime, visitType, isDeleted) VALUES (?, ?, ?, ?, NOW(), 'Walk-in', 0)`,
      [userID, petID, serviceID, completedStatusID],
    );

    res
      .status(201)
      .json({ message: "Visit created successfully", visitID: visit.insertId });
  } catch (err) {
    console.error("Error creating visit:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};
