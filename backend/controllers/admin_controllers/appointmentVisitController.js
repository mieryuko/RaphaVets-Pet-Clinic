import db from "../../config/db.js";
import { createAppointmentNotification } from "../notificationController.js"; // Import notification function

const toIsoDate = (value) => {
  if (!value) return null;

  // Preserve plain DATE strings from DB/request without timezone conversion.
  if (typeof value === "string") {
    const direct = value.trim().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(direct)) {
      return direct;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDisplayTime = (value) => {
  if (!value) return null;

  // Handles both "HH:mm:ss" DB values and full datetime values.
  const normalized = String(value).length <= 8 ? `1970-01-01T${value}` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const toPetAgeLabel = (dob) => {
  if (!dob) return "Unknown";
  const birth = new Date(dob);
  const now = new Date();

  if (Number.isNaN(birth.getTime()) || birth > now) return "Unknown";

  const diffMs = now.getTime() - birth.getTime();
  const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysOld < 7) {
    return `${daysOld} day${daysOld === 1 ? "" : "s"} old`;
  }

  if (daysOld < 28) {
    const weeksOld = Math.floor(daysOld / 7);
    return `${weeksOld} week${weeksOld === 1 ? "" : "s"} old`;
  }

  if (daysOld < 365) {
    const monthsOld = Math.floor(daysOld / 30);
    return `${monthsOld} month${monthsOld === 1 ? "" : "s"} old`;
  }

  let yearsOld = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    yearsOld--;
  }

  return `${yearsOld} yr${yearsOld === 1 ? "" : "s"} old`;
};

const emitAppointmentsUpdated = (req, payload = {}) => {
  try {
    const io = req.app?.get("io");
    if (!io) return;

    io.emit("appointments_updated", {
      at: new Date().toISOString(),
      ...payload,
    });
  } catch (socketError) {
    console.error("⚠️ Socket emit failed (appointments_updated):", socketError.message);
  }
};



export const assignAppointment = async (req, res) => {
  try {
    const { userID, petID, serviceID, date, time } = req.body;

    const missingFields = [];
    if (!petID) missingFields.push("petID");
    if (!serviceID) missingFields.push("serviceID");
    if (!date) missingFields.push("date");
    if (!time) missingFields.push("time");

    if (missingFields.length > 0) {
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

    const [timeRow] = await db.execute(
      `
         SELECT
            scheduledTimeID
         FROM scheduletime_tbl
         WHERE scheduleTime = ?
      `,
      [dbTimeFormat],
    );

    if (timeRow.length === 0) {
      return res.status(400).json({
        message: "Invalid time slot",
        details: `Time '${time}' not found in available slots`,
      });
    }

    const scheduledTimeID = timeRow[0].scheduledTimeID;

    // Prevent double-booking of a date/time slot for active scheduled appointments.
    const [conflictRows] = await db.execute(
      `SELECT a.appointmentID
       FROM appointment_tbl a
       JOIN appointment_status_tbl s ON s.statusID = a.statusID
       WHERE a.appointmentDate = ?
         AND a.scheduledTimeID = ?
         AND a.visitType = 'Scheduled'
         AND a.isDeleted = 0
         AND s.statusName NOT IN ('Cancelled', 'Rejected', 'Completed', 'Missed')
       LIMIT 1`,
      [date, scheduledTimeID],
    );

    if (conflictRows.length > 0) {
      return res.status(409).json({
        message: "This date and time slot is already occupied.",
        code: "SLOT_OCCUPIED",
      });
    }

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

    emitAppointmentsUpdated(req, {
      action: "appointment_created",
      appointmentId,
      accID: userID,
      petID,
    });

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
        status: () => ({ json: () => {} }),
      };

      await createAppointmentNotification(notifReq, notifRes);
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
            p.dateOfBirth,
            p.petGender AS petSex,
            p.weight_kg AS weight,
            b.breedName,
            CONCAT(ac.firstName, ' ', ac.lastName) as ownerName,
            ci.contactNo,
            sc.scheduleTime,
            s.statusName,
            ac.email,
            sv.service,
            sv.description
         FROM appointment_tbl a
         JOIN appointment_status_tbl s ON s.statusID = a.statusID
         JOIN pet_tbl p ON p.petID = a.petID
         JOIN account_tbl ac ON ac.accID = a.accID
        LEFT JOIN clientinfo_tbl ci ON ci.accID = ac.accID
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
            p.dateOfBirth,
            p.petGender,
            p.weight_kg,
            b.breedName,
            CONCAT(ac.firstName, ' ', ac.lastName) as ownerName,
            ci.contactNo,
            ac.email,
            sv.service,
            sv.description,
            st.scheduleTime,
            s.statusName
         FROM appointment_tbl a
         JOIN appointment_status_tbl s ON s.statusID = a.statusID
         JOIN pet_tbl p ON p.petID = a.petID
         JOIN service_tbl sv ON sv.serviceID = a.serviceID
         JOIN breed_tbl b ON b.breedID = p.breedID
         JOIN account_tbl ac ON ac.accID = a.accID
         LEFT JOIN clientinfo_tbl ci ON ci.accID = ac.accID
         LEFT JOIN scheduletime_tbl st on st.scheduledTimeID = a.scheduledTimeID
         WHERE visitDateTime IS NOT NULL
            AND a.isDeleted = FALSE
         ORDER BY visitDateTime DESC
        `);

    const cleanedAppointments = appointments.map((apt) => ({
      id: apt.appointmentID,
      petName: apt.petName,
      petAge: toPetAgeLabel(apt.dateOfBirth),
      petSex: apt.petSex,
      weight: apt.weight,
      breedName: apt.breedName,
      owner: apt.ownerName,
      phone: apt.contactNo || null,
      email: apt.email,
      date: toIsoDate(apt.appointmentDate),
      time: toDisplayTime(apt.scheduleTime),
      status: apt.statusName,
      visitType: apt.visitType,
      serviceType: apt.service,
      description: apt.description,
      accID: apt.accID, // Include for notification reference
    }));

    const cleanedVisits = visits.map((vst) => ({
      id: vst.appointmentID,
      petName: vst.petName,
      petAge: toPetAgeLabel(vst.dateOfBirth),
      petSex: vst.petGender,
      weight: vst.weight_kg,
      breedName: vst.breedName,
      owner: vst.ownerName,
      phone: vst.contactNo || null,
      email: vst.email,
      date: toIsoDate(vst.visitDateTime),
      time: toDisplayTime(vst.visitDateTime),
      scheduledTime: toDisplayTime(vst.scheduleTime),
      visitType: vst.visitType,
      status: vst.statusName,
      serviceType: vst.service,
      description: vst.description,
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
      age: toPetAgeLabel(p.dateOfBirth),
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
            status: () => ({ json: () => {} }),
          };

          await createAppointmentNotification(notifReq, notifRes);
        } catch (notifError) {
          console.error(
            `⚠️ Failed to send notification for appointment ${apt.appointmentID}:`,
            notifError,
          );
        }
      }
    }
    await connection.commit();

    emitAppointmentsUpdated(req, {
      action: "appointment_status_updated",
      appointmentIds: editableIDs,
      status,
    });

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
        status: () => ({ json: () => {} }),
      };

      await createAppointmentNotification(notifReq, notifRes);
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

    emitAppointmentsUpdated(req, {
      action: "appointment_deleted",
      appointmentIds: ids,
    });

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

    emitAppointmentsUpdated(req, {
      action: "visit_created",
      visitId: visit.insertId,
      accID: userID,
      petID,
    });

    res
      .status(201)
      .json({ message: "Visit created successfully", visitID: visit.insertId });
  } catch (err) {
    console.error("Error creating visit:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};
