import express from "express";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  sendVerificationCode,
  verifyCode, checkEmailExists,
  logoutUser,
} from "../controllers/authController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password")
      .isLength({ min: 8 })
      .matches(/[A-Z]/)
      .matches(/[a-z]/)
      .matches(/[*\-@$]/)
      .withMessage("Password must meet the requirements"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginUser
);
router.post("/send-code", sendVerificationCode);
router.post("/verify-code", verifyCode);
router.post("/check-email", checkEmailExists);

// Logout route
router.post("/logout", verifyToken, logoutUser);


export default router;
