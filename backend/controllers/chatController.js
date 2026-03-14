import OpenAI from "openai";
import dotenv from "dotenv";
import { getAllFAQs } from "../model/faqModel.js";
import { saveMessage, getRecentMessages } from "../model/chatModel.js";
import { getMemory, updateMemory } from "../model/memoryModel.js";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cosine similarity for embeddings
function cosineSimilarity(a, b) {
  if (!a || !b) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Summarize conversation for memory
const summarizeConversation = async (messages) => {
  const summaryPrompt = `
Summarize this conversation into LONG-TERM MEMORY.
Keep only important facts: pet type, age, health concerns, owner preferences.
Remove small talk.

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join("\n")}
`;
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "system", content: summaryPrompt }],
    temperature: 0.2,
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content || "";
};

export const chatWithGPT = async (req, res) => {
  const { message } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!message || !message.trim()) return res.status(400).json({ error: "Message is required" });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: "AI service is not configured. Please set OPENAI_API_KEY on the server.",
    });
  }

  try {
    // 1️⃣ Save user message
    await saveMessage(userId, "user", message);

    // 2️⃣ Fetch independent data in parallel to reduce latency.
    const [historyRaw, faqs, memoryFromDb] = await Promise.all([
      getRecentMessages(userId, 6),
      getAllFAQs(),
      getMemory(userId),
    ]);

    // Sanitize roles for OpenAI
    const history = historyRaw
      .filter(m => m.role && m.content)
      .map(m => ({
        role: ["user", "assistant"].includes(m.role) ? m.role : "assistant",
        content: m.content
      }));

    // 4️⃣ Generate embedding for user question
    let faqText = "No relevant FAQ found.";
    try {
      const userEmbRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: message,
      });
      const userVector = userEmbRes.data[0]?.embedding || [];

      // 5️⃣ Find top 3 similar FAQs
      const topFAQs = faqs
        .filter((f) => Array.isArray(f.embedding) && f.embedding.length === userVector.length)
        .map((f) => ({ ...f, score: cosineSimilarity(userVector, f.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      faqText = topFAQs.length
        ? topFAQs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
        : "No relevant FAQ found.";
    } catch (embeddingError) {
      console.error("Embedding step failed, continuing without FAQ similarity:", embeddingError?.message || embeddingError);
    }

    // 6️⃣ Load user memory
    let memory = memoryFromDb;

    // Summarize conversation if too long
    if (history.length >= 20) {
      const summary = await summarizeConversation(history);
      memory = memory ? memory + "\n" + summary : summary;
      await updateMemory(userId, memory);
    }

    // 7️⃣ Build GPT system message
    const systemPrompt = `
  You are "Rapha", the official AI assistant of RaphaVets Clinic.

  LONG TERM USER MEMORY:
  ${memory || "No stored memory."}

  Use this memory and the FAQ data below when relevant:
  ${faqText}

  BEHAVIOR PROCESS:
  1) Understand the user's intent first.
  2) Prefer factual clinic/FAQ guidance from context above.
  3) If details are missing, ask one clear follow-up question.
  4) Give practical next steps the user can do now.
  5) Escalate to a real veterinarian when there is health risk, diagnosis request, or emergency signal.

  RULES:
  • Scope: answer only pet care guidance and RaphaVets clinic information.
  • Safety: never diagnose, prescribe medication, or provide dosage instructions.
  • Privacy: never expose personal or account data of any other user.
  • Honesty: if uncertain, say so clearly and suggest contacting the clinic.
  • Tone: calm, empathetic, and professional.
  • Language restriction: reply only in English or Filipino (Tagalog).
  • If the user writes in another language, politely ask them to continue in English or Filipino.
  • Format: concise response (2-5 sentences), unless the user asks for more detail.

  MANDATORY ESCALATION LINE (when diagnosis/treatment is requested):
  "I can't provide a medical diagnosis online. Please consult a licensed veterinarian at RaphaVets for a proper check-up."
  `;

    // 8️⃣ Build messages for GPT
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    // 9️⃣ Call GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      temperature: 0.3,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content || "I'm having trouble answering right now.";

    // 10️⃣ Save GPT reply
    await saveMessage(userId, "assistant", reply);

    // 11️⃣ Return response
    res.json({
      reply,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("GPT ERROR:", error?.message || error);
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await getRecentMessages(userId, 8);

    // Map DB format to frontend format
    const messages = history.map(m => ({
      from: m.role === "user" ? "user" : "system",
      text: m.content,
      timestamp: m.timestamp,
    }));

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load chat history" });
  }
};

