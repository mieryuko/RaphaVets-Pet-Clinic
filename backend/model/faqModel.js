import pool from "../config/db.js";

// Fetch all FAQs
export const getAllFAQs = async () => {
  const [rows] = await pool.execute("SELECT * FROM faqs");
  return rows.map(f => ({
    ...f,
    embedding: JSON.parse(f.embedding) // convert JSON back to array
  }));
};

// Update embedding
export const updateFAQEmbedding = async (id, embedding) => {
  await pool.execute(
    "UPDATE faqs SET embedding = ? WHERE id = ?",
    [JSON.stringify(embedding), id]
  );
};
