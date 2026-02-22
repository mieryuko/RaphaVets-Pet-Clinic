import db from "../config/db.js";
import bcrypt from "bcryptjs";

export const getUserPreference = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM userpreference_tbl WHERE accId = ?",
      [id]
    );

    if (rows.length === 0) {
      // if no record yet, create one with default values
      await db.query(
        "INSERT INTO userpreference_tbl (accId, appointmentReminders, petHealthUpd, promoEmail, clinicAnnouncement) VALUES (?, 1, 0, 1, 0)",
        [id]
      );

      return res.status(200).json({
        appointmentReminders: 1,
        petHealthUpd: 0,
        promoEmail: 1,
        clinicAnnouncement: 0,
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("❌ Error fetching user preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserPreference = async (req, res) => {
  const { id } = req.params;
  const {
    appointmentReminders,
    petHealthUpd,
    promoEmail,
    clinicAnnouncement,
  } = req.body;

  try {
    const [result] = await db.query(
      `
      UPDATE userpreference_tbl 
      SET appointmentReminders=?, petHealthUpd=?, promoEmail=?, clinicAnnouncement=? 
      WHERE accId=?
      `,
      [
        appointmentReminders,
        petHealthUpd,
        promoEmail,
        clinicAnnouncement,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      // if user preference doesn't exist, insert instead
      await db.query(
        `
        INSERT INTO userpreference_tbl 
        (accId, appointmentReminders, petHealthUpd, promoEmail, clinicAnnouncement)
        VALUES (?, ?, ?, ?, ?)
        `,
        [id, appointmentReminders, petHealthUpd, promoEmail, clinicAnnouncement]
      );
    }

    res.status(200).json({ message: "Preferences updated successfully" });
  } catch (error) {
    console.error("❌ Error updating user preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getUserProfile = async (req, res) => {
  const { id } = req.params;
  console.log("📥 getUserProfile called with ID:", req.params.id);

  try {
    const [rows] = await db.query(
      `
      SELECT 
        a.accId, a.roleID, a.firstName, a.lastName, a.email,
        c.address, c.contactNo
      FROM account_tbl AS a
      LEFT JOIN clientInfo_tbl AS c ON a.accId = c.accId
      WHERE a.accId = ?
      `,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(rows[0]);
    console.log("✅ Response sent");
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
  
};

// Get current authenticated user profile
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const id = req.user.id;
    const [rows] = await db.query(
      `
      SELECT 
        a.accId, a.roleID, a.firstName, a.lastName, a.email,
        c.address, c.contactNo
      FROM account_tbl AS a
      LEFT JOIN clientInfo_tbl AS c ON a.accId = c.accId
      WHERE a.accId = ?
      `,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('❌ Error fetching current user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changeUserPassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }
    const [userRows] = await db.query("SELECT password FROM account_tbl WHERE accId = ?", [id]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const storedHashedPassword = userRows[0].password;
    const isMatch = await bcrypt.compare(currentPassword, storedHashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    
    // Update both password and passwordChangeAt timestamp
    await db.query(
      "UPDATE account_tbl SET password = ?, passwordChangeAt = NOW(), lastUpdatedAt = NOW() WHERE accId = ?",
      [hashedNewPassword, id]
    );

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, address, contactNo } = req.body;

  try {
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const accountQuery = `
      UPDATE account_tbl
      SET firstName = ?, lastName = ?, email = ?, 
          ${password ? "password = ?, " : ""} lastUpdatedAt = NOW()
      WHERE accId = ?;
    `;

    const accountValues = password
      ? [firstName, lastName, email, hashedPassword, id]
      : [firstName, lastName, email, id];

    await db.query(accountQuery, accountValues);

    const [clientExists] = await db.query(
      "SELECT * FROM clientInfo_tbl WHERE accId = ?",
      [id]
    );

    if (clientExists.length > 0) {
      await db.query(
        "UPDATE clientInfo_tbl SET address = ?, contactNo = ? WHERE accId = ?",
        [address, contactNo, id]
      );
    } else {
      await db.query(
        "INSERT INTO clientInfo_tbl (accId, address, contactNo) VALUES (?, ?, ?)",
        [id, address, contactNo]
      );
    }

    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user activity log (login, logout, password changes, latest pet addition)
export const getUserActivityLog = async (req, res) => {
  const { id } = req.params;

  try {
    // Get the most recent login activity
    const [loginActivity] = await db.query(
      `
      SELECT 
        'Login' as type,
        'Logged in successfully' as description,
        logInAt as date,
        'fa-right-to-bracket' as icon,
        '#5EE6FE' as color
      FROM account_tbl 
      WHERE accId = ? AND logInAt IS NOT NULL AND logInAt != '0000-00-00 00:00:00'
      ORDER BY logInAt DESC
      LIMIT 1
      `,
      [id]
    );

    // Get the most recent logout activity
    const [logoutActivity] = await db.query(
      `
      SELECT 
        'Logout' as type,
        'Logged out from web app' as description,
        logOutAt as date,
        'fa-right-from-bracket' as icon,
        '#E85D5D' as color
      FROM account_tbl 
      WHERE accId = ? AND logOutAt IS NOT NULL AND logOutAt != '0000-00-00 00:00:00'
      ORDER BY logOutAt DESC
      LIMIT 1
      `,
      [id]
    );

    // Get the most recent password change activity
    const [passwordActivity] = await db.query(
      `
      SELECT 
        'Password Change' as type,
        'Updated account password' as description,
        passwordChangeAt as date,
        'fa-lock' as icon,
        '#16C47F' as color
      FROM account_tbl 
      WHERE accId = ? AND passwordChangeAt IS NOT NULL AND passwordChangeAt != '0000-00-00 00:00:00'
      ORDER BY passwordChangeAt DESC
      LIMIT 1
      `,
      [id]
    );

    // Get ONLY the most recent pet addition
    const [latestPet] = await db.query(
      `
      SELECT 
        'Pet Added' as type,
        CONCAT('Added a new pet named ', petName) as description,
        createdAt as date,
        'fa-paw' as icon,
        '#F9AE16' as color
      FROM pet_tbl 
      WHERE accID = ? AND isDeleted = 0 AND createdAt IS NOT NULL
      ORDER BY createdAt DESC
      LIMIT 1
      `,
      [id]
    );

    // Create activities array in FIXED ORDER: Login, Pet Added, Password Change, Logout
    const activities = [];
    
    // 1. Add Login (if exists)
    if (loginActivity.length > 0) {
      activities.push(loginActivity[0]);
    }
    
    // 2. Add Pet Added (if exists)
    if (latestPet.length > 0) {
      activities.push(latestPet[0]);
    }
    
    // 3. Add Password Change (if exists)
    if (passwordActivity.length > 0) {
      activities.push(passwordActivity[0]);
    }
    
    // 4. Add Logout (if exists)
    if (logoutActivity.length > 0) {
      activities.push(logoutActivity[0]);
    }

    // Format dates for display
    const formattedActivities = activities.map(activity => ({
      ...activity,
      date: formatDate(activity.date)
    }));

    res.status(200).json(formattedActivities);
  } catch (error) {
    console.error("❌ Error fetching user activity log:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleDateString('en-US', options);
};