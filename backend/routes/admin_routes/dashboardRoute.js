import express from 'express';
import { getDashboardStats, 
        getAppointmentsGraphData,
        getRecentActivities  
    } from "../../controllers/admin_controllers/dashboardController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/roleMiddleware.js";

const router = express.Router();

router.get('/stats', verifyToken, allowRoles(2, 3), getDashboardStats);
router.get('/appointments-graph', verifyToken, allowRoles(2, 3), getAppointmentsGraphData);
router.get('/recent-activities', verifyToken, allowRoles(2, 3), getRecentActivities);
export default router;