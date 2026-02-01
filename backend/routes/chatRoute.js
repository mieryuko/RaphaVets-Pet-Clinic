import express from "express";
import { chatWithGPT } from "../controllers/chatController.js";

const router = express.Router();

// POST /api/chat
router.post("/", chatWithGPT);

export default router;
