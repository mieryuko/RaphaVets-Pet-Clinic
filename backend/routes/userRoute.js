import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "✅ /api/users root reached" });
});

// Protect these routes with verifyToken
router.get("/:id", verifyToken, getUserProfile);
router.put("/:id", verifyToken, updateUserProfile);

router.get("/test", (req, res) => {
  res.json({ message: "User routes working!" });
});

export default router;
