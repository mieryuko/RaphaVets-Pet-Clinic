import OpenAI from "openai";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getAllFAQs() {
  const [rows] = await pool.execute("SELECT id, question FROM faqs");
  return rows;
}

async function updateFAQEmbedding(id, embedding) {
  await pool.execute(
    "UPDATE faqs SET embedding = ? WHERE id = ?",
    [JSON.stringify(embedding), id]
  );
}

async function generateEmbeddings() {
  try {
    const faqs = await getAllFAQs();

    if (faqs.length === 0) {
      return;
    }


    for (const faq of faqs) {
      if (!faq.question) continue;

      // Generate embedding for the question
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: faq.question
      });

      const embedding = embeddingRes.data[0].embedding;

      // Save embedding to database
      await updateFAQEmbedding(faq.id, embedding);

    }

    process.exit(0);

  } catch (err) {
    console.error("❌ Error generating embeddings:", err);
    process.exit(1);
  }
}

generateEmbeddings();
