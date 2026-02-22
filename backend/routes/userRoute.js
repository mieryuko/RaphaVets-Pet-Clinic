import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  getCurrentUser,
  updateUserProfile,
  changeUserPassword,
  getUserPreference,
  updateUserPreference,
  getUserActivityLog,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "✅ /api/users root reached" });
});

// Current authenticated user
router.get("/me", verifyToken, getCurrentUser);

// Profile routes
router.get("/:id/profile", verifyToken, getUserProfile);
router.put("/:id/profile", verifyToken, updateUserProfile);

// Password route
router.put("/:id/change-password", verifyToken, changeUserPassword);

// Notification preference routes
router.get("/:id/preferences", verifyToken, getUserPreference);
router.put("/:id/preferences", verifyToken, updateUserPreference);

//Get Activity log
router.get("/activity-log/:id", verifyToken, getUserActivityLog);

export default router;
