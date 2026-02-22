import db from "../../config/db.js";

// Your existing getDashboardStats function remains the same
export const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.user.id;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get the logged-in admin's name
    const [adminRows] = await db.query(`
      SELECT firstName, lastName 
      FROM account_tbl 
      WHERE accId = ? AND (roleID = 2 OR roleID = 3) AND isDeleted = 0
    `, [adminId]);

    if (adminRows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Get total pet owners (all client users who are not deleted)
    const [ownerRows] = await db.query(`
      SELECT COUNT(*) as totalOwners 
      FROM account_tbl 
      WHERE roleID = 1 AND isDeleted = 0
    `);

    // Get total pets - only from non-deleted owners
    const [petRows] = await db.query(`
      SELECT COUNT(*) as totalPets 
      FROM pet_tbl p
      INNER JOIN account_tbl a ON p.accID = a.accId
      WHERE p.isDeleted = 0 AND a.isDeleted = 0 AND a.roleID = 1
    `);

    const [upComingAppointments] = await db.query(`
      SELECT COUNT(*) as totalUpComingAppointments
      FROM appointment_tbl a
      JOIN appointment_status_tbl ast ON a.statusID = ast.statusID
      WHERE ast.statusName = 'Upcoming'
    `);

    const [missingPets] = await db.query(`
      SELECT COUNT(*) as totalMissingPets
      FROM forum_posts_tbl
      WHERE isDeleted = 0 AND postType = "Lost"
    `);

    const adminName = `${adminRows[0].firstName} ${adminRows[0].lastName}`;
    console.log(adminName);

    const stats = {
      adminName,
      totalOwners: ownerRows[0]?.totalOwners || 0,
      totalPets: petRows[0]?.totalPets || 0,
      totalUpComingAppointments: upComingAppointments[0]?.totalUpComingAppointments || 0,
      totalMissingPets: missingPets[0]?.totalMissingPets || 0,
    };

    res.json(stats);
  } catch (err) {
    console.error("❌ Failed to fetch dashboard stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Method for graph data (appointments over time - last 6 months)
export const getAppointmentsGraphData = async (req, res) => {
  try {
    // Get monthly appointment counts for the last 6 months
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(a.createdAt, '%b') as month,
        COUNT(*) as appointments
      FROM appointment_tbl a
      WHERE a.createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND a.isDeleted = 0
      GROUP BY DATE_FORMAT(a.createdAt, '%Y-%m')
      ORDER BY MIN(a.createdAt) ASC
    `);

    // Month name mapping for consistent display
    const monthMap = {
      'Jan': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Apr',
      'May': 'May', 'Jun': 'Jun', 'Jul': 'July', 'Aug': 'Aug',
      'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dec'
    };

    // Ensure we have data for all 6 months (fill missing months with 0)
    const last6Months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      last6Months.push({
        month: monthMap[monthName] || monthName,
        appointments: 0
      });
    }

    // Merge actual data with the last 6 months template
    const formattedData = last6Months.map(monthData => {
      const found = rows.find(r => r.month === monthData.month);
      return {
        month: monthData.month,
        appointments: found ? found.appointments : 0
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error("❌ Failed to fetch appointments graph data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Method for recent activities (admin dashboard)
export const getRecentActivities = async (req, res) => {
  try {
    console.log("🔍 Fetching recent activities...");
    
    // Get recent pet additions
    const [petActivities] = await db.query(`
      SELECT 
        CONCAT('Added new pet ', p.petName) as action,
        p.createdAt as date,
        'pet_added' as type,
        a.firstName,
        a.lastName
      FROM pet_tbl p
      INNER JOIN account_tbl a ON p.accID = a.accId
      WHERE p.isDeleted = 0 AND a.isDeleted = 0
      ORDER BY p.createdAt DESC
      LIMIT 2
    `);

    // Get recent appointment activities
    const [appointmentActivities] = await db.query(`
      SELECT 
        CONCAT(
          CASE 
            WHEN ast.statusName = 'Upcoming' THEN 'New upcoming appointment for '
            WHEN ast.statusName = 'Completed' THEN 'Completed appointment for '
            WHEN ast.statusName = 'Cancelled' THEN 'Cancelled appointment for '
            ELSE 'Appointment updated for '
          END,
          p.petName
        ) as action,
        a_tbl.lastUpdatedAt as date,
        'appointment' as type,
        acc.firstName,
        acc.lastName
      FROM appointment_tbl a_tbl
      INNER JOIN pet_tbl p ON a_tbl.petID = p.petID
      INNER JOIN account_tbl acc ON a_tbl.accID = acc.accId
      LEFT JOIN appointment_status_tbl ast ON a_tbl.statusID = ast.statusID
      WHERE a_tbl.isDeleted = 0
      ORDER BY a_tbl.lastUpdatedAt DESC
      LIMIT 2
    `);

    // Get recent forum posts - FIXED: Added table alias to createdAt
    const [forumActivities] = await db.query(`
      SELECT 
        CONCAT(
          CASE 
            WHEN f.postType = 'Lost' THEN 'Lost pet report: '
            ELSE 'Found pet report: '
          END,
          LEFT(f.description, 30),
          '...'
        ) as action,
        f.createdAt as date,
        'forum' as type,
        a.firstName,
        a.lastName
      FROM forum_posts_tbl f
      INNER JOIN account_tbl a ON f.accID = a.accId
      WHERE f.isDeleted = 0
      ORDER BY f.createdAt DESC
      LIMIT 2
    `);

    // Get recent pet care tips - FIXED: Added table alias to createdAt
    const [tipActivities] = await db.query(`
      SELECT 
        CONCAT('Added pet care tip: ', LEFT(t.title, 30), '...') as action,
        t.createdAt as date,
        'tip' as type,
        a.firstName,
        a.lastName
      FROM pet_care_tips_content_tbl t
      INNER JOIN account_tbl a ON t.accID = a.accId
      WHERE t.isDeleted = 0
      ORDER BY t.createdAt DESC
      LIMIT 1
    `);

    // Get recent videos - FIXED: Added table alias to createdAt
    const [videoActivities] = await db.query(`
      SELECT 
        CONCAT('Added video: ', LEFT(v.videoTitle, 30), '...') as action,
        v.createdAt as date,
        'video' as type,
        a.firstName,
        a.lastName
      FROM video_content_tbl v
      INNER JOIN account_tbl a ON v.accID = a.accId
      WHERE v.isDeleted = 0
      ORDER BY v.createdAt DESC
      LIMIT 1
    `);

    // Get new user registrations - This one is fine since it only queries account_tbl
    const [userActivities] = await db.query(`
      SELECT 
        CONCAT('New ', 
          CASE 
            WHEN roleID = 1 THEN 'pet owner'
            WHEN roleID = 2 THEN 'admin'
            WHEN roleID = 3 THEN 'veterinarian'
          END,
          ' registered: ', firstName, ' ', lastName
        ) as action,
        createdAt as date,
        'user' as type,
        firstName,
        lastName
      FROM account_tbl 
      WHERE isDeleted = 0
      ORDER BY createdAt DESC
      LIMIT 1
    `);

    // Combine all activities
    const allActivities = [
      ...petActivities,
      ...appointmentActivities,
      ...forumActivities,
      ...tipActivities,
      ...videoActivities,
      ...userActivities
    ];

    // Sort by date (most recent first) and take top 5
    const sortedActivities = allActivities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(activity => ({
        action: activity.action,
        time: formatTimeAgo(activity.date),
        user: activity.firstName && activity.lastName 
          ? `${activity.firstName} ${activity.lastName}`
          : null
      }));

    res.json(sortedActivities);
  } catch (err) {
    console.error("❌ Failed to fetch recent activities:", err);
    console.error("❌ Error details:", err.message);
    console.error("❌ SQL Error:", err.sqlMessage);
    res.status(500).json({ message: "Server error", error: err.message });
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