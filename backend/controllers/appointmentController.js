import db from "../config/db.js";

const AUTO_CANCEL_INTERVAL_MS = 10 * 60 * 1000;
let lastAutoCancelRunAt = 0;

const TIME_SLOTS_CACHE_TTL_MS = 10 * 60 * 1000;
const timeSlotsCache = {
  data: null,
  expiresAt: 0,
};

const getCachedTimeSlots = async () => {
  if (Array.isArray(timeSlotsCache.data) && Date.now() < timeSlotsCache.expiresAt) {
    return timeSlotsCache.data;
  }

  const [rows] = await db.query(
    "SELECT scheduledTimeID, scheduleTime FROM scheduletime_tbl ORDER BY scheduleTime"
  );

  timeSlotsCache.data = rows;
  timeSlotsCache.expiresAt = Date.now() + TIME_SLOTS_CACHE_TTL_MS;
  return rows;
};

// Helper function to cancel past pending appointments
const cancelPastPendingAppointments = async () => {
  const now = Date.now();
  if (now - lastAutoCancelRunAt < AUTO_CANCEL_INTERVAL_MS) return;

  try {
    lastAutoCancelRunAt = now;
    // Get all pending appointments with past dates
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    // Assuming statusID 1 is "Pending" and statusID 4 is "Cancelled"
    //‼️Would it be better to look up statusID for "Pending" and "Cancelled"
    //⚠️from the database instead of hardcoding?
    const [result] = await db.query(
      `UPDATE appointment_tbl 
       SET statusID = 4 
       WHERE statusID = 1 AND appointmentDate < ? AND appointmentDate IS NOT NULL`,
      [today]
    );
    
  } catch (err) {
    console.error("❌ Error auto-cancelling past appointments:", err);
  }
};

export const getAllServices = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, p.category, p.label, p.price
      FROM service_tbl s
      LEFT JOIN service_pricing_tbl p ON s.serviceID = p.serviceID
      ORDER BY s.serviceID, p.category, p.price
    `);

    // Group pricing under each service
    const services = [];
    const map = {};

    for (const row of rows) {
      if (!map[row.serviceID]) {
        map[row.serviceID] = {
          serviceID: row.serviceID,
          service: row.service,
          shortDescription: row.description,
          longDescription: row.long_description,
          note: row.note,
          duration: row.duration,
          pricing: {}
        };
        services.push(map[row.serviceID]);
      }

      if (row.category && row.label) {
        if (!map[row.serviceID].pricing[row.category]) {
          map[row.serviceID].pricing[row.category] = [];
        }
        map[row.serviceID].pricing[row.category].push({
          label: row.label,
          price: row.price
        });
      }
    }

    res.json(services);
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
    // Auto-cancel past pending appointments first
    await cancelPastPendingAppointments();

    const allTimeSlots = await getCachedTimeSlots();
    const scheduleTimeById = new Map(
      allTimeSlots.map((slot) => [slot.scheduledTimeID, slot.scheduleTime])
    );

    // Get all booked slots for the date
    const [bookedRows] = await db.query(
      `SELECT a.scheduledTimeID
       FROM appointment_tbl a
       WHERE a.appointmentDate = ? 
       AND a.statusID != 4 and a.statusID != 3
       AND a.isDeleted = 0`,
      [date]
    );

    const bookedSlots = bookedRows
      .map((row) => scheduleTimeById.get(row.scheduledTimeID))
      .filter(Boolean);
    
    // Check if the requested date is today
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;
    
    let pastSlots = [];
    
    if (isToday) {
      // Get current time in Philippines time (UTC+8)
      const now = new Date();
      const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
      const currentHour = phTime.getHours();
      const currentMinute = phTime.getMinutes();
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00`;
      
      pastSlots = allTimeSlots
        .map(slot => slot.scheduleTime)
        .filter(time => time < currentTimeStr);
    }
    
    res.json({
      bookedSlots,
      pastSlots: isToday ? pastSlots : [] // Only return past slots if it's today
    });
  } catch (err) {
    console.error("❌ Failed to fetch booked slots:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllTime = async (req, res) => {
  try {
    const rows = await getCachedTimeSlots();
    
    // Return the raw time format - let frontend handle formatting
    const timeSlots = rows.map(row => ({
      scheduledTimeID: row.scheduledTimeID,
      scheduleTime: row.scheduleTime, // Use scheduleTime field
      endTime: row.endTime || null
    }));

    res.json(timeSlots);
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
    const { petID, serviceID, appointmentDate, startTime } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!petID) missingFields.push('petID');
    if (!serviceID) missingFields.push('serviceID');
    if (!appointmentDate) missingFields.push('appointmentDate');
    if (!startTime) missingFields.push('startTime');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields",
        missingFields 
      });
    }

    const [timeRows] = await db.query(
      "SELECT scheduledTimeID FROM scheduletime_tbl WHERE scheduleTime = ?",
      [startTime] // Use scheduleTime field
    );

    if (timeRows.length === 0) {
      return res.status(400).json({ 
        message: "Invalid time slot",
        details: `Time '${startTime}' not found in available slots` 
      });
    }

    const scheduledTimeID = timeRows[0].scheduledTimeID;

    const sql = `
      INSERT INTO appointment_tbl
        (accID, petID, serviceID, appointmentDate, scheduledTimeID, visitType, statusID, isDeleted)
      VALUES (?, ?, ?, ?, ?, "Scheduled", 1, 0)
    `;

    const [result] = await db.query(sql, [
      userId,
      petID,
      serviceID,
      appointmentDate,
      scheduledTimeID,
    ]);

    res.status(201).json({
      message: "Appointment booked successfully",
      appointmentId: result.insertId,
    });
  } catch (err) {
    console.error("❌ Booking error:", err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Auto-cancel past pending appointments first
    await cancelPastPendingAppointments();

    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        a.appointmentID AS id,
        p.petName,
        CONCAT(u.firstName, ' ', u.lastName) AS ownerName,
        s.service AS type,
        CONCAT(DATE_FORMAT(a.appointmentDate, '%b %e, %Y'), ' - ', st.scheduleTime) AS date,
        ast.statusName AS status
      FROM appointment_tbl a
      JOIN pet_tbl p ON a.petID = p.petID
      JOIN service_tbl s ON a.serviceID = s.serviceID
      JOIN account_tbl u ON a.accID = u.accId
      JOIN scheduletime_tbl st ON a.scheduledTimeID = st.scheduledTimeID
      JOIN appointment_status_tbl ast ON a.statusID = ast.statusID
      WHERE a.accID = ?
      ORDER BY a.appointmentDate DESC, st.scheduleTime DESC;
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { appointmentId } = req.params;
    const userId = req.user.id;

    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    // Get appointment details before cancelling (for notification)
    const [appointmentDetails] = await db.query(
      `SELECT a.appointmentDate, p.accID as petOwnerId 
       FROM appointment_tbl a
       JOIN pet_tbl p ON a.petID = p.petID
       WHERE a.appointmentID = ?`,
      [appointmentId]
    );

    if (appointmentDetails.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Verify the appointment belongs to the user and is in a cancellable status
    const [appointments] = await db.query(
      `SELECT a.appointmentID, a.statusID, ast.statusName
       FROM appointment_tbl a
       JOIN appointment_status_tbl ast ON a.statusID = ast.statusID
       WHERE a.appointmentID = ? AND a.accID = ?`,
      [appointmentId, userId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = appointments[0];
    const currentStatus = appointment.statusName.toLowerCase();

    // Only allow cancellation of upcoming or pending appointments
    if (currentStatus !== 'upcoming' && currentStatus !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot cancel appointment with status: ${appointment.statusName}` 
      });
    }

    // Update appointment status to Cancelled (statusID 4)
    const [result] = await db.query(
      `UPDATE appointment_tbl 
       SET statusID = 4 
       WHERE appointmentID = ? AND accID = ?`,
      [appointmentId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Failed to cancel appointment" });
    }

    res.status(200).json({ 
      message: "Appointment cancelled successfully",
      appointmentId: appointmentId
    });
  } catch (err) {
    console.error("❌ Error cancelling appointment:", err);
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
    });
  }
};
