import express from "express";
import { body } from "express-validator";
import {
  loginUser,
  checkEmailExists,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from "../controllers/authController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginUser
);

router.post("/check-email", checkEmailExists);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-reset-token/:token", verifyResetToken);

// Logout route
router.post("/logout", verifyToken, logoutUser);

export default router;