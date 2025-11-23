import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/roleMiddleware.js";
import { 
    assignAppointment,
    getAppointmentAndVisits,
    updateStatus,
    deleteAppointment,
 } from "../../controllers/admin_controllers/appointmentVisitController.js";

const router = express.Router();

router.post("/assign", verifyToken, allowRoles(2, 3), assignAppointment)
router.get("/", verifyToken, allowRoles(2, 3), getAppointmentAndVisits);
router.patch("/status", verifyToken, allowRoles(2,3), updateStatus);
router.delete("/", verifyToken, allowRoles(2,3), deleteAppointment,);

export default router;
