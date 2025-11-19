import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import pool from "../config/db.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// ✅ FIX: Use createTransport (singular), not createTransporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test the email configuration (optional)
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

export const checkEmailExists = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const [rows] = await pool.query("SELECT accId FROM account_tbl WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error("❌ Error checking email:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const [users] = await pool.query("SELECT * FROM account_tbl WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Account not found" 
      });
    }

    const user = users[0];
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await pool.query(
      "UPDATE account_tbl SET resetToken = ?, resetTokenExpiry = ? WHERE accId = ?",
      [resetToken, resetTokenExpiry, user.accId]
    );

    // Create reset link - using localhost for development
    const resetLink = `http://localhost:3000/change-password?token=${resetToken}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - RaphaVets Pet Clinic',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5EE6FE;">Password Reset Request</h2>
          <p>Hello ${user.firstName},</p>
          <p>You requested to reset your password for your RaphaVets Pet Clinic account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #5EE6FE; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <br>
          <p>Best regards,<br>RaphaVets Pet Clinic Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email"
    });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error sending reset email" 
    });
  }
};

export const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    const [users] = await pool.query(
      "SELECT * FROM account_tbl WHERE resetToken = ? AND resetTokenExpiry > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired reset token" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
      email: users[0].email
    });

  } catch (error) {
    console.error("❌ Token verification error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error verifying token" 
    });
  }
};

export const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: errors.array()[0].msg 
    });
  }

  const { token, newPassword } = req.body;

  try {
    // Verify token
    const [users] = await pool.query(
      "SELECT * FROM account_tbl WHERE resetToken = ? AND resetTokenExpiry > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired reset token" 
      });
    }

    const user = users[0];

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await pool.query(
      "UPDATE account_tbl SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE accId = ?",
      [hashedPassword, user.accId]
    );

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("❌ Password reset error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during password reset" 
    });
  }
};

// Your existing loginUser and other functions remain the same...
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM account_tbl WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // ✅ Check if account is deleted
    if (user.isDeleted) {
      return res.status(403).json({ message: "This account has been deleted" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Update login timestamp
    await pool.query(
      "UPDATE account_tbl SET logInAt = NOW() WHERE accId = ?",
      [user.accId]
    );

    const token = jwt.sign(
      { id: user.accId, email: user.email, role: user.roleID },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.accId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.roleID,
      },
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userId = req.userId; // optional, may be undefined

    if (userId) {
      // Update logout timestamp if possible
      await pool.query("UPDATE account_tbl SET logOutAt = NOW() WHERE accId = ?", [userId]);
    } else {
      console.log("⚠️ No userId found (token may be expired). Proceeding with logout.");
    }

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};