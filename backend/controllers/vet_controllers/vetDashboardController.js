import db from "../../config/db.js";
import bcrypt from "bcryptjs";

// GET /vet/dashboard/stats - Get vet profile info
export const getVetDashboardStats = async (req, res) => {
  try {
    const vetId = req.user.id; // From verifyToken middleware
    console.log("🔍 Fetching vet stats for ID:", vetId);

    // Get vet details from account_tbl only first
    const [userRows] = await db.execute(
      `SELECT 
        accId,
        firstName,
        lastName,
        email,
        roleID
       FROM account_tbl 
       WHERE accId = ? AND isDeleted = 0`,
      [vetId]
    );

    if (userRows.length === 0) {
      console.log("❌ No user found with ID:", vetId);
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];
    console.log("👤 User found:", user);

    // Try to get phone number from vet_table if it exists
    let phoneNumber = null;
    try {
      const [vetRows] = await db.execute(
        `SELECT phone_number FROM vet_table WHERE accId = ?`,
        [vetId]
      );
      if (vetRows.length > 0) {
        phoneNumber = vetRows[0].phone_number;
      }
    } catch (err) {
      console.log("⚠️ vet_table query failed (might not exist):", err.message);
      // Continue without vet_table data
    }

    const vetName = `Dr. ${user.firstName} ${user.lastName}`;
    console.log("✅ Vet name formatted:", vetName);

    // Get today's appointments count
    const today = new Date().toISOString().split('T')[0];
    const [todayAppointments] = await db.execute(
      `SELECT COUNT(*) as count
       FROM appointment_tbl 
       WHERE appointmentDate = ? AND isDeleted = 0`,
      [today]
    );

    // Get total patients count (you might want to customize this query)
    const [totalPatients] = await db.execute(
      `SELECT COUNT(DISTINCT petID) as count
       FROM appointment_tbl 
       WHERE isDeleted = 0`,
      []
    );

    // Get pending appointments count
    const [pendingAppointments] = await db.execute(
      `SELECT COUNT(*) as count
       FROM appointment_tbl a
       JOIN appointment_status_tbl s ON a.statusID = s.statusID
       WHERE s.statusName = 'Pending' AND a.isDeleted = 0`
    );

    const response = {
      vetName: vetName,
      email: user.email,
      phone: phoneNumber,
      stats: {
        todayAppointments: todayAppointments[0]?.count || 0,
        totalPatients: totalPatients[0]?.count || 0,
        pendingAppointments: pendingAppointments[0]?.count || 0
      }
    };
    
    console.log("✅ Sending response:", response);
    res.json(response);

  } catch (error) {
    console.error("❌ Error fetching vet stats:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message
    });
  }
};

// POST /vet/change-password - Change vet password
export const changeVetPassword = async (req, res) => {
  try {
    const vetId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    console.log("🔐 Password change request for vet ID:", vetId);

    // Validation
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

    // Get user's current password
    const [userRows] = await db.execute(
      "SELECT password FROM account_tbl WHERE accId = ? AND isDeleted = 0",
      [vetId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, userRows[0].password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Current password is incorrect" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
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