import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getUserPreference,
  updateUserPreference,
  deleteUserAccount,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "✅ /api/users root reached" });
});

// Profile routes
router.get("/:id/profile", verifyToken, getUserProfile);
router.put("/:id/profile", verifyToken, updateUserProfile);

// Password route
router.put("/:id/change-password", verifyToken, changeUserPassword);

// Notification preference routes
router.get("/:id/preferences", verifyToken, getUserPreference);
router.put("/:id/preferences", verifyToken, updateUserPreference);

// DELETE user account
router.delete("/:id/delete-account", verifyToken, deleteUserAccount);

export default router;
