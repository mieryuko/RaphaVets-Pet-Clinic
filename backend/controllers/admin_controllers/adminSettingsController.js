import db from '../../config/db.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { generateRandomPassword } from '../../middleware/passwordGenerator.js';

const ROLE_MAP = {
  admin: 2,
  veterinarian: 3,
};

const ROLE_NAME = {
  2: 'admin',
  3: 'veterinarian',
};

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user, pass },
  });
};

const normalizeType = (type = '') => type.toString().trim().toLowerCase();
const NAME_REGEX = /^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+63\d{10}$/;

const validateInputPayload = ({ firstName, lastName, email, phone }) => {
  const trimmedFirstName = (firstName || '').trim();
  const trimmedLastName = (lastName || '').trim();
  const trimmedEmail = (email || '').trim();
  const normalizedPhone = (phone || '').trim();

  if (!NAME_REGEX.test(trimmedFirstName)) {
    return 'First name should contain letters only.';
  }

  if (!NAME_REGEX.test(trimmedLastName)) {
    return 'Last name should contain letters only.';
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return 'Invalid email format.';
  }

  if (!PHONE_REGEX.test(normalizedPhone)) {
    return 'Phone number must be in +63 followed by 10 digits.';
  }

  return null;
};

const normalizePhoneForDb = (phone) => {
  const digits = (phone || '').toString().replace(/\D/g, '');
  return digits || '';
};

const toLocalPhoneDigits = (phone) => {
  const digits = (phone || '').toString().replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('63') && digits.length >= 12) {
    return digits.slice(2, 12);
  }

  if (digits.startsWith('0') && digits.length >= 11) {
    return digits.slice(1, 11);
  }

  if (digits.length >= 10) {
    return digits.slice(-10);
  }

  return digits;
};

const toClientUser = (row) => ({
  id: row.accId,
  firstName: row.firstName,
  lastName: row.lastName,
  email: row.email,
  phone: toLocalPhoneDigits(row.phoneNumber),
  type: ROLE_NAME[row.roleID] || 'unknown',
  createdAt: row.createdAt,
});

export const getAdminSettingsUsers = async (req, res) => {
  try {
    const { search = '' } = req.query;

    const params = [2, 3];
    let query = `
      SELECT
        a.accId,
        a.roleID,
        a.firstName,
        a.lastName,
        a.email,
        a.createdAt,
        CASE
          WHEN a.roleID = 2 THEN ai.phone_number
          WHEN a.roleID = 3 THEN vt.phone_number
          ELSE NULL
        END AS phoneNumber
      FROM account_tbl a
      LEFT JOIN admin_info_tbl ai ON ai.accID = a.accId
      LEFT JOIN vet_table vt ON vt.accId = a.accId
      WHERE a.isDeleted = 0 AND a.roleID IN (?, ?)
    `;

    if (search) {
      query += `
        AND (
          CONCAT(a.firstName, ' ', a.lastName) LIKE ?
          OR a.email LIKE ?
        )
      `;
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch);
    }

    query += ' ORDER BY CASE WHEN a.roleID = 2 THEN 0 ELSE 1 END, a.createdAt DESC';

    const [rows] = await db.execute(query, params);

    const admins = rows.filter((row) => row.roleID === 2).map(toClientUser);
    const veterinarians = rows.filter((row) => row.roleID === 3).map(toClientUser);

    return res.status(200).json({
      success: true,
      data: {
        admins,
        veterinarians,
      },
    });
  } catch (error) {
    console.error('Error fetching admin settings users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

export const createAdminSettingsUser = async (req, res) => {
  try {
    const { type, firstName, lastName, email, phone } = req.body;
    const normalizedType = normalizeType(type);
    const roleID = ROLE_MAP[normalizedType];

    if (!roleID) {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: 'firstName, lastName, and email are required' });
    }

    const validationError = validateInputPayload({ firstName, lastName, email, phone });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const safeFirstName = firstName.trim();
    const safeLastName = lastName.trim();
    const safeEmail = email.trim();
    const safePhone = phone.trim();

    const [existing] = await db.execute(
      'SELECT accId FROM account_tbl WHERE email = ? AND isDeleted = 0 LIMIT 1',
      [safeEmail]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const plainPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const connection = await db.getConnection();
    let newUserId;

    try {
      await connection.beginTransaction();

      const [insertResult] = await connection.execute(
        `INSERT INTO account_tbl
         (roleID, firstName, lastName, email, password, isDeleted)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [roleID, safeFirstName, safeLastName, safeEmail, hashedPassword]
      );

      newUserId = insertResult.insertId;
      const phoneNumber = normalizePhoneForDb(safePhone);

      if (roleID === 2) {
        await connection.execute(
          `INSERT INTO admin_info_tbl (accID, phone_number)
           VALUES (?, ?)`,
          [newUserId, phoneNumber]
        );
      } else if (roleID === 3) {
        await connection.execute(
          `INSERT INTO vet_table (accId, phone_number)
           VALUES (?, ?)`,
          [newUserId, phoneNumber]
        );
      }

      await connection.commit();
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }

    let emailSent = false;
    const transporter = getTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: safeEmail,
          subject: 'RaphaVets Account Credentials',
          html: `
            <p>Hello ${safeFirstName},</p>
            <p>Your ${normalizedType} account has been created.</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Temporary Password:</strong> ${plainPassword}</p>
            <p>Please change your password after your first login.</p>
          `,
        });
        emailSent = true;
      } catch (mailError) {
        console.error('Failed to send account email:', mailError);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUserId,
        firstName: safeFirstName,
        lastName: safeLastName,
        email: safeEmail,
        phone: safePhone || '',
        type: normalizedType,
      },
      emailSent,
      generatedPassword: emailSent ? undefined : plainPassword,
    });
  } catch (error) {
    console.error('Error creating admin settings user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

export const updateAdminSettingsUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, message: 'firstName, lastName, and email are required' });
    }

    const validationError = validateInputPayload({ firstName, lastName, email, phone });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const safeFirstName = firstName.trim();
    const safeLastName = lastName.trim();
    const safeEmail = email.trim();
    const safePhone = phone.trim();

    const [existing] = await db.execute(
      `SELECT accId FROM account_tbl
       WHERE email = ? AND accId <> ? AND isDeleted = 0
       LIMIT 1`,
      [safeEmail, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const [targetUserRows] = await db.execute(
      `SELECT accId, roleID FROM account_tbl
       WHERE accId = ? AND roleID IN (2, 3) AND isDeleted = 0
       LIMIT 1`,
      [userId]
    );

    if (targetUserRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const targetUser = targetUserRows[0];
    const phoneNumber = normalizePhoneForDb(safePhone);
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        `UPDATE account_tbl
         SET firstName = ?, lastName = ?, email = ?, lastUpdatedAt = NOW()
         WHERE accId = ? AND roleID IN (2, 3) AND isDeleted = 0`,
        [safeFirstName, safeLastName, safeEmail, userId]
      );

      if (targetUser.roleID === 2) {
        const [adminInfoRows] = await connection.execute(
          `SELECT adminID FROM admin_info_tbl WHERE accID = ? LIMIT 1`,
          [userId]
        );

        if (adminInfoRows.length > 0) {
          await connection.execute(
            `UPDATE admin_info_tbl SET phone_number = ? WHERE accID = ?`,
            [phoneNumber, userId]
          );
        } else {
          await connection.execute(
            `INSERT INTO admin_info_tbl (accID, phone_number) VALUES (?, ?)`,
            [userId, phoneNumber]
          );
        }
      }

      if (targetUser.roleID === 3) {
        const [vetInfoRows] = await connection.execute(
          `SELECT vetId FROM vet_table WHERE accId = ? LIMIT 1`,
          [userId]
        );

        if (vetInfoRows.length > 0) {
          await connection.execute(
            `UPDATE vet_table SET phone_number = ? WHERE accId = ?`,
            [phoneNumber, userId]
          );
        } else {
          await connection.execute(
            `INSERT INTO vet_table (accId, phone_number) VALUES (?, ?)`,
            [userId, phoneNumber]
          );
        }
      }

      await connection.commit();
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: Number(userId),
        firstName: safeFirstName,
        lastName: safeLastName,
        email: safeEmail,
        phone: safePhone || '',
      },
    });
  } catch (error) {
    console.error('Error updating admin settings user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

export const deleteAdminSettingsUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [result] = await db.execute(
      `UPDATE account_tbl
       SET isDeleted = 1, lastUpdatedAt = NOW()
       WHERE accId = ? AND roleID IN (2, 3) AND isDeleted = 0`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting admin settings user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};
