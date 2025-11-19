import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/roleMiddleware.js";
import { getAppointmentAndVisits } from "../../controllers/admin_controllers/appointmentVisitController.js";

const router = express.Router();

router.get("/", verifyToken, allowRoles(2, 3), getAppointmentAndVisits);

export default router;
