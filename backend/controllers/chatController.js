import OpenAI from "openai";
import { getAllFAQs } from "../model/faqModel.js";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cosine similarity for embedding
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]*b[i];
    normA += a[i]*a[i];
    normB += b[i]*b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const chatWithGPT = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    // 1️⃣ Fetch FAQs from DB
    const faqs = await getAllFAQs();

    // 2️⃣ Generate embedding for user question
    const userEmbRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message
    });
    const userVector = userEmbRes.data[0].embedding;

    // 3️⃣ Find top 3 similar FAQs
    const topFAQs = faqs
      .map(f => ({ ...f, score: cosineSimilarity(userVector, f.embedding) }))
      .sort((a,b) => b.score - a.score)
      .slice(0,3);

    const faqText = topFAQs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n");

    // 4️⃣ Call GPT
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are "Rapha", a pet care assistant for RaphaVets Clinic. Use the following FAQs and general pet care knowledge:
${faqText}

Rules:
1. Only answer questions related to pet care tips or clinic FAQs.
2. Never provide medical diagnoses or advice for serious conditions.
3. If unsure, politely say: "I'm not allowed to provide a diagnosis. Please consult a veterinarian by booking an appointment."
4. Keep answers factual, concise, and professional.
5. Do not answer unrelated questions. Reply: "Sorry, I can only answer questions about pet care and our clinic."
6. Reply in the same language as the user's question.
7. Limit your answers to 100 letters.
          `
        },
        { role: "user", content: message }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const reply = response.choices[0].message.content;

    res.json({ reply, usage: response.usage });

  } catch (error) {
    console.error("GPT Error:", error);
    res.status(500).json({ error: "Something went wrong with GPT" });
  }
};
