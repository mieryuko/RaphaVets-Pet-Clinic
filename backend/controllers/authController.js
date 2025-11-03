import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import pool from "../config/db.js";
import nodemailer from "nodemailer";

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { firstName, lastName, email, password } = req.body;

  try {
    const [existing] = await pool.query("SELECT * FROM account_tbl WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO account_tbl (firstName, lastName, email, password) VALUES (?, ?, ?, ?)", [
      firstName,
      lastName,
      email,
      hashedPassword,
    ]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Server error in registerUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM account_tbl WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("🧠 User from DB:", user);

    const token = jwt.sign(
      { id: user.accId, email: user.email, role: user.userType }, // ✅ include role
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.accId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.userType, // ✅ include role in response
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

let verificationCodes = {}; // temporary store (you can use Redis or DB for production)

// ✅ Send verification code to email
export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  verificationCodes[email] = code;

  console.log(`📩 Verification code for ${email}: ${code}`);

  // OPTIONAL: Send via email using nodemailer
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`,
    });

    res.json({ success: true, message: "Verification code sent." });
  } catch (err) {
    console.error("❌ Error sending email:", err);
    res.status(500).json({ success: false, message: "Failed to send verification code" });
  }
};

// ✅ Verify code entered by user
export const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ success: false, message: "Missing email or code" });

  if (verificationCodes[email] === code) {
    delete verificationCodes[email]; // remove after use
    return res.json({ success: true, message: "Code verified" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid or expired code" });
  }
};