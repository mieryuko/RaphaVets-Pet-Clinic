import express from 'express';
import { getDashboardStats } from "../../controllers/admin_controllers/dashboardController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/roleMiddleware.js";

const router = express.Router();

router.get('/stats', verifyToken, allowRoles(2, 3), getDashboardStats);

export default router;