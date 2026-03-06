import db from "../../config/db.js";
import { buildOptimizedImageUrlFromStoredName } from "../../utils/cloudinary.js";

const resolvePetImageUrl = (imageName) => {
  if (!imageName) return "/images/dog-profile.png";
  if (/^https?:\/\//i.test(imageName)) return imageName;

  const optimizedUrl = buildOptimizedImageUrlFromStoredName(imageName);
  if (optimizedUrl) return optimizedUrl;

  return `/api/pets/images/${imageName}`;
};
import bcrypt from "bcryptjs";

// GET /vet/dashboard/stats - Get vet profile info and dashboard stats
export const getVetDashboardStats = async (req, res) => {
  try {
    const vetId = req.user.id;
    console.log("🔍 Fetching vet dashboard stats for ID:", vetId);

    // Get the logged-in vet's name
    const [vetRows] = await db.execute(
      `SELECT firstName, lastName, email 
       FROM account_tbl 
       WHERE accId = ? AND roleID = 3 AND isDeleted = 0`,
      [vetId]
    );

    if (vetRows.length === 0) {
      // Try without role filter as fallback
      const [fallbackRows] = await db.execute(
        `SELECT firstName, lastName, email FROM account_tbl WHERE accId = ? AND isDeleted = 0`,
        [vetId]
      );
      
      if (fallbackRows.length === 0) {
        return res.status(404).json({ message: "Vet not found" });
      }
      
      const fallbackVet = fallbackRows[0];
      const vetName = `Dr. ${fallbackVet.firstName} ${fallbackVet.lastName}`;
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // 1. Today's appointments count
      const [todayAppointments] = await db.execute(
        `SELECT COUNT(*) as count
         FROM appointment_tbl a
         JOIN appointment_status_tbl s ON a.statusID = s.statusID
         WHERE a.appointmentDate = ? 
           AND a.isDeleted = 0
           AND s.statusName IN ('Upcoming', 'Pending')`,
        [today]
      );

      // 2. This week's visits count (last 7 days) — include walk-in appointments
      const [weeklyVisits] = await db.execute(
        `SELECT COUNT(*) as count
         FROM appointment_tbl a
         WHERE (
           (a.appointmentDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND a.appointmentDate <= CURDATE())
           OR
           (a.appointmentDate IS NULL AND DATE(a.visitDateTime) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND DATE(a.visitDateTime) <= CURDATE())
         )
         AND a.isDeleted = 0`,
        []
      );

      // 3. Total patients (unique pets)
      const [totalPatients] = await db.execute(
        `SELECT COUNT(*) as totalPets 
      FROM pet_tbl p
      INNER JOIN account_tbl a ON p.accID = a.accId
      WHERE p.isDeleted = 0 AND a.isDeleted = 0 AND a.roleID = 1`,
        []
      );

      // 4. Total pet owners
      const [totalOwners] = await db.execute(
        `SELECT COUNT(*) as count
         FROM account_tbl 
         WHERE roleID = 1 AND isDeleted = 0`,
        []
      );

      // 5. Total pets registered
      const [totalPets] = await db.execute(
        `SELECT COUNT(*) as totalPets 
          FROM pet_tbl p
          INNER JOIN account_tbl a ON p.accID = a.accId
          WHERE p.isDeleted = 0 AND a.isDeleted = 0 AND a.roleID = 1`,
        []
      );

      return res.json({
        vetName: vetName,
        email: fallbackVet.email,
        todayAppointments: todayAppointments[0]?.count || 0,
        weeklyVisits: weeklyVisits[0]?.count || 0,
        totalPatients: totalPatients[0]?.totalPets || 0,
        totalOwners: totalOwners[0]?.count || 0,
        totalPets: totalPets[0]?.totalPets || 0
      });
    }

    const vet = vetRows[0];
    const vetName = `Dr. ${vet.firstName} ${vet.lastName}`;

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // 1. Today's appointments count
    const [todayAppointments] = await db.execute(
      `SELECT COUNT(*) as count
       FROM appointment_tbl a
       JOIN appointment_status_tbl s ON a.statusID = s.statusID
       WHERE a.appointmentDate = ? 
         AND a.isDeleted = 0
         AND s.statusName IN ('Upcoming', 'Pending')`,
      [today]
    );

    // 2. This week's visits count (last 7 days) — include walk-in appointments
    const [weeklyVisits] = await db.execute(
      `SELECT COUNT(*) as count
       FROM appointment_tbl a
       WHERE (
         (a.appointmentDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND a.appointmentDate <= CURDATE())
         OR
         (a.appointmentDate IS NULL AND DATE(a.visitDateTime) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND DATE(a.visitDateTime) <= CURDATE())
       )
       AND a.isDeleted = 0`,
      []
    );

    // 3. Total patients (unique pets this vet has seen)
    const [totalPatients] = await db.execute(
      `SELECT COUNT(DISTINCT p.petID) as count
       FROM appointment_tbl a
       JOIN pet_tbl p ON a.petID = p.petID
       WHERE a.isDeleted = 0`,
      []
    );

    // 4. Total pet owners (all clients)
    const [totalOwners] = await db.execute(
      `SELECT COUNT(*) as count
       FROM account_tbl 
       WHERE roleID = 1 AND isDeleted = 0`,
      []
    );

    // 5. Total pets registered
    const [totalPets] = await db.execute(
      `SELECT COUNT(*) as totalPets
      FROM pet_tbl p
      INNER JOIN account_tbl a ON p.accID = a.accId
      WHERE p.isDeleted = 0 AND a.isDeleted = 0 AND a.roleID = 1`,
      []
    );

    const response = {
      vetName: vetName,
      email: vet.email,
      todayAppointments: todayAppointments[0]?.count || 0,
      weeklyVisits: weeklyVisits[0]?.count || 0,
      totalPatients: totalPatients[0]?.count || 0,
      totalOwners: totalOwners[0]?.count || 0,
      totalPets: totalPets[0]?.totalPets || 0
    };

    console.log("✅ Vet dashboard stats:", response);
    res.json(response);

  } catch (error) {
    console.error("❌ Error fetching vet dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /vet/dashboard/appointments-graph - Get weekly appointments graph data
export const getAppointmentsGraphData = async (req, res) => {
  try {
    // Get daily appointments for the last 7 days
    const [rows] = await db.execute(`
      SELECT 
        DAYNAME(appointmentDate) as day,
        DAYOFWEEK(appointmentDate) as dayOrder,
        COUNT(*) as appointments
      FROM appointment_tbl
      WHERE appointmentDate >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND appointmentDate <= CURDATE()
        AND isDeleted = 0
      GROUP BY appointmentDate, DAYNAME(appointmentDate), DAYOFWEEK(appointmentDate)
      ORDER BY appointmentDate ASC
    `);

    // Create an array of all days in order
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Initialize with zeros
    const weeklyData = days.map(day => ({
      day: day.substring(0, 3), // Mon, Tue, etc.
      appointments: 0,
      fullDay: day
    }));

    // Fill in actual data
    rows.forEach(row => {
      const dayIndex = days.findIndex(d => d === row.day);
      if (dayIndex !== -1) {
        weeklyData[dayIndex].appointments = row.appointments;
      }
    });

    res.json(weeklyData);
  } catch (error) {
    console.error("❌ Error fetching appointments graph data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /vet/dashboard/todays-appointments - Get today's appointments list
export const getTodaysAppointments = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [appointments] = await db.execute(`
      SELECT 
        a.appointmentID as id,
        CASE
          WHEN st.scheduleTime IS NOT NULL THEN TIME_FORMAT(st.scheduleTime, '%l:%i %p')
          WHEN a.visitDateTime IS NOT NULL THEN TIME_FORMAT(TIME(a.visitDateTime), '%l:%i %p')
          ELSE 'Walk-in'
        END as time,
        CONCAT(p.petName, ' - ', b.breedName) as patient,
        s.service as service,
        CONCAT(acc.firstName, ' ', acc.lastName) as owner,
        ast.statusName as status
      FROM appointment_tbl a
      JOIN pet_tbl p ON a.petID = p.petID
      JOIN breed_tbl b ON p.breedID = b.breedID
      JOIN service_tbl s ON a.serviceID = s.serviceID
      JOIN account_tbl acc ON a.accID = acc.accId
      LEFT JOIN scheduletime_tbl st ON a.scheduledTimeID = st.scheduledTimeID
      JOIN appointment_status_tbl ast ON a.statusID = ast.statusID
      WHERE (
        a.appointmentDate = ?
        OR (a.appointmentDate IS NULL AND DATE(a.visitDateTime) = ?)
      )
        AND a.isDeleted = 0
      ORDER BY COALESCE(st.scheduleTime, TIME(a.visitDateTime)) ASC
    `, [today, today]);

    res.json(appointments);
  } catch (error) {
    console.error("❌ Error fetching today's appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /vet/dashboard/recent-patients - Get recently added patients
export const getRecentPatients = async (req, res) => {
  try {
    const [patients] = await db.execute(`
      SELECT 
        p.petID as id,
        p.petName as name,
        b.breedName as breed,
        b.species as type,
        CONCAT(acc.firstName, ' ', acc.lastName) as owner,
        DATE_FORMAT(p.createdAt, '%b %e, %Y') as addedDate,
        p.imageName as image
      FROM pet_tbl p
      JOIN breed_tbl b ON p.breedID = b.breedID
      JOIN account_tbl acc ON p.accID = acc.accId
      WHERE p.isDeleted = 0
      ORDER BY p.createdAt DESC
      LIMIT 5
    `);

    // Format image URLs
    const formattedPatients = patients.map(patient => ({
      ...patient,
      image: resolvePetImageUrl(patient.image)
    }));

    res.json(formattedPatients);
  } catch (error) {
    console.error("❌ Error fetching recent patients:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /vet/dashboard/upcoming-appointments - Get upcoming appointments
export const getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [appointments] = await db.execute(`
      SELECT 
        a.appointmentID as id,
        DATE_FORMAT(a.appointmentDate, '%b %e') as date,
        CASE
          WHEN st.scheduleTime IS NOT NULL THEN TIME_FORMAT(st.scheduleTime, '%l:%i %p')
          ELSE NULL
        END as time,
        CONCAT(p.petName, ' - ', b.breedName) as patient,
        s.service as service,
        CONCAT(acc.firstName, ' ', acc.lastName) as owner
      FROM appointment_tbl a
      JOIN pet_tbl p ON a.petID = p.petID
      JOIN breed_tbl b ON p.breedID = b.breedID
      JOIN service_tbl s ON a.serviceID = s.serviceID
      JOIN account_tbl acc ON a.accID = acc.accId
      LEFT JOIN scheduletime_tbl st ON a.scheduledTimeID = st.scheduledTimeID
      JOIN appointment_status_tbl ast ON a.statusID = ast.statusID
      WHERE a.appointmentDate >= ?
        AND a.isDeleted = 0
        AND ast.statusName IN ('Upcoming', 'Pending')
      ORDER BY a.appointmentDate ASC, st.scheduleTime ASC
      LIMIT 5
    `, [today]);

    res.json(appointments);
  } catch (error) {
    console.error("❌ Error fetching upcoming appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /vet/dashboard/recent-activities - Get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    console.log("🔍 Fetching recent activities for vet dashboard...");

    // Get recent appointments
    const [appointmentActivities] = await db.execute(`
      SELECT 
        CONCAT(
          'New appointment for ',
          p.petName,
          ' (',
          s.service,
          ')'
        ) as action,
        a.createdAt as date,
        'appointment' as type,
        CONCAT(acc.firstName, ' ', acc.lastName) as user
      FROM appointment_tbl a
      JOIN pet_tbl p ON a.petID = p.petID
      JOIN service_tbl s ON a.serviceID = s.serviceID
      JOIN account_tbl acc ON a.accID = acc.accId
      WHERE a.isDeleted = 0
      ORDER BY a.createdAt DESC
      LIMIT 3
    `);

    // Get new patient registrations
    const [patientActivities] = await db.execute(`
      SELECT 
        CONCAT('New patient registered: ', p.petName) as action,
        p.createdAt as date,
        'patient' as type,
        CONCAT(acc.firstName, ' ', acc.lastName) as user
      FROM pet_tbl p
      JOIN account_tbl acc ON p.accID = acc.accId
      WHERE p.isDeleted = 0
      ORDER BY p.createdAt DESC
      LIMIT 2
    `);

    // Get completed appointments
    const [completedActivities] = await db.execute(`
      SELECT 
        CONCAT(
          'Completed appointment for ',
          p.petName
        ) as action,
        a.visitDateTime as date,
        'completed' as type,
        CONCAT(acc.firstName, ' ', acc.lastName) as user
      FROM appointment_tbl a
      JOIN pet_tbl p ON a.petID = p.petID
      JOIN account_tbl acc ON a.accID = acc.accId
      WHERE a.visitDateTime IS NOT NULL
        AND a.isDeleted = 0
      ORDER BY a.visitDateTime DESC
      LIMIT 2
    `);

    // Combine all activities
    const allActivities = [
      ...appointmentActivities,
      ...patientActivities,
      ...completedActivities
    ];

    // Sort by date (most recent first)
    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(activity => ({
        action: activity.action,
        time: formatTimeAgo(activity.date),
        user: activity.user || null
      }));

    res.json(sortedActivities);
  } catch (error) {
    console.error("❌ Error fetching recent activities:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return 'Just now';
  } catch (e) {
    return 'Unknown time';
  }
};

// GET /vet/dashboard/patient-stats - Get patient statistics
export const getPatientStats = async (req, res) => {
  try {
    // Patients by species
    const [bySpecies] = await db.execute(`
      SELECT 
        b.species,
        COUNT(*) as count
      FROM pet_tbl p
      JOIN breed_tbl b ON p.breedID = b.breedID
      WHERE p.isDeleted = 0
      GROUP BY b.species
    `);

    // Patients by gender
    const [byGender] = await db.execute(`
      SELECT 
        petGender as gender,
        COUNT(*) as count
      FROM pet_tbl
      WHERE isDeleted = 0
      GROUP BY petGender
    `);

    // Most common breeds
    const [topBreeds] = await db.execute(`
      SELECT 
        b.breedName,
        COUNT(*) as count
      FROM pet_tbl p
      JOIN breed_tbl b ON p.breedID = b.breedID
      WHERE p.isDeleted = 0
      GROUP BY p.breedID, b.breedName
      ORDER BY count DESC
      LIMIT 5
    `);

    res.json({
      bySpecies,
      byGender,
      topBreeds
    });
  } catch (error) {
    console.error("❌ Error fetching patient stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /vet/dashboard/upcoming-appointments-full - Get all upcoming appointments (for calendar view)
export const getAllUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [appointments] = await db.execute(`
      SELECT 
        a.appointmentID as id,
        a.appointmentDate as date,
        CASE
          WHEN st.scheduleTime IS NOT NULL THEN TIME_FORMAT(st.scheduleTime, '%H:%i')
          ELSE NULL
        END as time,
        CONCAT(p.petName, ' (', b.breedName, ')') as title,
        s.service as service,
        CONCAT(acc.firstName, ' ', acc.lastName) as owner,
        ast.statusName as status,
        p.petID as petId,
        a.accID as ownerId
      FROM appointment_tbl a
      JOIN pet_tbl p ON a.petID = p.petID
      JOIN breed_tbl b ON p.breedID = b.breedID
      JOIN service_tbl s ON a.serviceID = s.serviceID
      JOIN account_tbl acc ON a.accID = acc.accId
      LEFT JOIN scheduletime_tbl st ON a.scheduledTimeID = st.scheduledTimeID
      JOIN appointment_status_tbl ast ON a.statusID = ast.statusID
      WHERE a.appointmentDate >= ?
        AND a.isDeleted = 0
        AND ast.statusName NOT IN ('Completed', 'Cancelled', 'Rejected', 'Missed')
      ORDER BY a.appointmentDate ASC, st.scheduleTime ASC
    `, [today]);

    res.json(appointments);
  } catch (error) {
    console.error("❌ Error fetching all upcoming appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /vet/change-password - Change vet password
export const changeVetPassword = async (req, res) => {
  try {
    const vetId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    console.log("🔐 Password change request for vet ID:", vetId);

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: "New password and confirm password do not match" 
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[*\-@\$]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character (* - @ $)" 
      });
    }

    const [userRows] = await db.execute(
      "SELECT password FROM account_tbl WHERE accId = ? AND isDeleted = 0",
      [vetId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, userRows[0].password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Current password is incorrect" 
      });
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, userRows[0].password);
    if (isSameAsCurrent) {
      return res.status(400).json({
        message: "New password is the same with current password"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await db.execute(
      "UPDATE account_tbl SET password = ?, passwordChangeAt = NOW(), lastUpdatedAt = NOW() WHERE accId = ?",
      [hashedNewPassword, vetId]
    );

    console.log("✅ Password changed successfully for vet ID:", vetId);
    res.json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("❌ Error changing password:", error);
    res.status(500).json({ 
      message: "Server error while changing password",
      error: error.message 
    });
  }
};