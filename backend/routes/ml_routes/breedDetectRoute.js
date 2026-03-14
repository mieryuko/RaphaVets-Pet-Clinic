// Node (ESM) - multer + forward
import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/predict/breed", upload.single("file"), async (req, res) => {
  try {

    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const mlUrl = (process.env.ML_URL || "http://localhost:5001").replace(
      /\/+$/g,
      "",
    );
    const timeoutMs = parseInt(process.env.ML_TIMEOUT_MS || "60000", 10);
    const maxRetries = parseInt(process.env.ML_RETRIES || "2", 10);

    let attempt = 0;
    let lastErr;
    while (attempt <= maxRetries) {
      try {
        const response = await axios.post(`${mlUrl}/predict_breed/`, formData, {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
          timeout: timeoutMs,
        });
        return res.json(response.data);
      } catch (err) {
        lastErr = err;
        attempt += 1;
        // on last attempt, break and return error
        if (attempt > maxRetries) break;
        // exponential backoff
        const backoff = 500 * attempt;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    console.error(
      "Error processing image after retries:",
      lastErr?.message || lastErr,
    );
    return res
      .status(502)
      .json({ error: "Failed to process the image via ML service." });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process the image." });
  }
});

export default router;
