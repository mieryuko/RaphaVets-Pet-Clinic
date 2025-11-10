import db from "../config/db.js";

export const getAllServices = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM service_tbl");
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch services:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookedSlots = async (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT startTime 
       FROM appointment_tbl 
       WHERE appointmentDate = ? 
       AND statusID != 3`
      [date]
    );

    console.log('Booked slots found:', rows);
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch booked slots:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllTime = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM starttime_tbl");
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch time slots:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;
    const { petID, serviceID, appointmentDate, startTime, endTime } = req.body;

    if (!petID || !serviceID || !appointmentDate || !startTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `
      INSERT INTO appointment_tbl
        (accID, petID, serviceID, appointmentDate, startTime, statusID)
      VALUES (?, ?, ?, ?, ?, 1)
    `;

    const [result] = await db.query(sql, [
      userId,
      petID,
      serviceID,
      appointmentDate,
      startTime,
    ]);

    // Send proper JSON response
    res.status(201).json({
      message: "Appointment booked successfully",
      appointmentId: result.insertId,
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        a.appointmentID AS id,
        p.petName,
        CONCAT(u.firstName, ' ', u.lastName) AS ownerName,
        s.service AS type,
        CONCAT(DATE_FORMAT(a.appointmentDate, '%b %e, %Y'), ' - ', a.startTime) AS date,
        CASE 
          WHEN a.statusID = 1 THEN 'Pending'
          WHEN a.statusID = 2 THEN 'Upcoming'
          WHEN a.statusID = 3 THEN 'Done'
          ELSE 'Unknown'
        END AS status
      FROM appointment_tbl a
      JOIN pet_tbl p ON a.petID = p.petID
      JOIN service_tbl s ON a.serviceID = s.serviceID
      JOIN account_tbl u ON a.accID = u.accId
      WHERE a.accID = ?
      ORDER BY a.appointmentDate DESC;
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
};
