import express from "express";
import { 
    getAllServices,
    getAllTime,
    bookAppointment,
    getBookedSlots,
    getUserAppointments,
 } from "../controllers/appointmentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/services", getAllServices);
router.get("/time", getAllTime);
router.get("/booked-slots", getBookedSlots);
router.get("/user", verifyToken, getUserAppointments);

// Protected routes
router.post("/book", verifyToken, bookAppointment);
export default router;