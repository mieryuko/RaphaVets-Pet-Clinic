import db from "../config/db.js";



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
    const [rows] = await db.query(
      `SELECT st.startTime 
       FROM appointment_tbl a
       JOIN scheduleTIme_tbl st ON a.scheduledTimeID = st.startTimeID
       WHERE a.appointmentDate = ? 
       AND a.statusID != 4`, // statusID 4 is 'Cancelled'
      [date]
    );

    // Convert database times to frontend format
    const bookedSlots = rows.map(row => {
      const [hours, minutes] = row.startTime.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    });

    console.log('Booked slots found:', bookedSlots);
    res.json(bookedSlots);
  } catch (err) {
    console.error("❌ Failed to fetch booked slots:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllTime = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM scheduleTIme_tbl");
    
    // Convert to frontend format
    const formattedTimes = rows.map(row => {
      const [hours, minutes] = row.startTime.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return {
        ...row,
        displayTime: `${displayHour}:${minutes} ${ampm}`
      };
    });

    res.json(formattedTimes);
  } catch (err) {
    console.error("❌ Failed to fetch time slots:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    console.log("📦 Booking request received:", {
      body: req.body,
      user: req.user
    });

    if (!req.user) {
      console.log("❌ No user in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;
    const { petID, serviceID, appointmentDate, startTime } = req.body;

    console.log("📋 Parsed data:", {
      userId,
      petID,
      serviceID,
      appointmentDate,
      startTime
    });

    // Validate required fields
    const missingFields = [];
    if (!petID) missingFields.push('petID');
    if (!serviceID) missingFields.push('serviceID');
    if (!appointmentDate) missingFields.push('appointmentDate');
    if (!startTime) missingFields.push('startTime');

    if (missingFields.length > 0) {
      console.log("❌ Missing fields:", missingFields);
      return res.status(400).json({ 
        message: "Missing required fields",
        missingFields 
      });
    }

    // Convert "12:00 PM" to "12:00:00" format
    const convertTo24Hour = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      
      if (modifier === 'PM' && hours !== '12') {
        hours = parseInt(hours, 10) + 12;
      }
      if (modifier === 'AM' && hours === '12') {
        hours = '00';
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
    };

    const dbTimeFormat = convertTo24Hour(startTime);
    console.log("🕒 Converted time:", { original: startTime, converted: dbTimeFormat });

    // First, get the startTimeID from scheduleTIme_tbl based on the time string
    console.log("🔍 Looking up time slot:", dbTimeFormat);
    const [timeRows] = await db.query(
      "SELECT startTimeID FROM scheduleTIme_tbl WHERE startTime = ?",
      [dbTimeFormat]
    );

    console.log("⏰ Time lookup results:", timeRows);

    if (timeRows.length === 0) {
      return res.status(400).json({ 
        message: "Invalid time slot",
        details: `Time '${startTime}' not found in available slots` 
      });
    }

    const scheduledTimeID = timeRows[0].startTimeID;

    const sql = `
      INSERT INTO appointment_tbl
        (accID, petID, serviceID, appointmentDate, scheduledTimeID, statusID)
      VALUES (?, ?, ?, ?, ?, 1)
    `;

    console.log("💾 Inserting appointment with:", {
      userId,
      petID,
      serviceID,
      appointmentDate,
      scheduledTimeID
    });

    const [result] = await db.query(sql, [
      userId,
      petID,
      serviceID,
      appointmentDate,
      scheduledTimeID,
    ]);

    console.log("✅ Appointment booked successfully, ID:", result.insertId);

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

    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        a.appointmentID AS id,
        p.petName,
        CONCAT(u.firstName, ' ', u.lastName) AS ownerName,
        s.service AS type,
        CONCAT(DATE_FORMAT(a.appointmentDate, '%b %e, %Y'), ' - ', st.startTime) AS date,
        ast.statusName AS status
      FROM appointment_tbl a
      JOIN pet_tbl p ON a.petID = p.petID
      JOIN service_tbl s ON a.serviceID = s.serviceID
      JOIN account_tbl u ON a.accID = u.accId
      JOIN scheduleTIme_tbl st ON a.scheduledTimeID = st.startTimeID
      JOIN appointment_status_tbl ast ON a.statusID = ast.statusID
      WHERE a.accID = ?
      ORDER BY a.appointmentDate DESC, st.startTime DESC;
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
};
