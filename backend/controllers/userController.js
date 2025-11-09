import db from "../config/db.js";
import bcrypt from "bcryptjs";

export const deleteUserAccount = async (req, res) => {
  const { id } = req.params; // user ID
  const { password } = req.body;

  try {
    // 1. Get the user's current hashed password
    const [userRows] = await db.query("SELECT password FROM account_tbl WHERE accId = ? AND isDeleted = 0", [id]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found or already deleted" });
    }

    const storedHashedPassword = userRows[0].password;
    const isMatch = await bcrypt.compare(password, storedHashedPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // 2. Soft delete the account (set isDeleted = 1)
    await db.query("UPDATE account_tbl SET isDeleted = 1, lastUpdatedAt = NOW() WHERE accId = ?", [id]);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    res.status(500).json({ message: "Server error" });
  }
};


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
    await db.query(
      "UPDATE account_tbl SET password = ?, lastUpdatedAt = NOW() WHERE accId = ?",
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
