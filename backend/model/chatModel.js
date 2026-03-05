import db from "../config/db.js";

// Save message
export const saveMessage = async (userId, role, message) => {
  // chat_messages.role is enum('user','system') in production schema.
  const normalizedRole = role === "user" ? "user" : "system";

  await db.execute(
    `INSERT INTO chat_messages (user_id, role, message)
     VALUES (?, ?, ?)`,
    [userId, normalizedRole, message]
  );
};

// Get recent messages
export const getRecentMessages = async (userId, limit = 8) => {
  const parsedLimit = Number.parseInt(limit, 10);
  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 8;

  const [rows] = await db.query(
    `SELECT role, message, created_at
     FROM chat_messages
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ${safeLimit}`,
    [userId]
  );

  // reverse so GPT reads conversation correctly
  return rows.reverse().map(m => ({
    role: m.role,
    content: m.message,
    timestamp: m.created_at
  }));
};