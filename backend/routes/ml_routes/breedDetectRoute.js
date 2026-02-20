// Node (ESM) - multer + forward
import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/predict/breed", upload.single("file"), async (req, res) => {
  try {
    console.log("Incoming file:", req.file); // debug

    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const mlUrl = process.env.ML_URL || "http://localhost:5001";
    const response = await axios.post(`${mlUrl}/breed/predict`, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    });

    res.json(response.data);
  } catch (error) {
    console.error("ML error status:", error.response?.status); 
    console.error("ML error data:", error.response?.data); 
    console.error("ML error message:", error.message); 
    res.status(500).json({ error: "Prediction failed" });
  }
});

export default router;
