import db from "../config/db.js";
import bcrypt from "bcryptjs";

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
