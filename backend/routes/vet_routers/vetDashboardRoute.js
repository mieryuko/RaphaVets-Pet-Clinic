import express from 'express';
import { 
  getVetDashboardStats,
  getAppointmentsGraphData,
  getTodaysAppointments,
  getRecentPatients,
  getUpcomingAppointments,
  getRecentActivities,
  getPatientStats,
  getAllUpcomingAppointments,
  changeVetPassword 
} from '../../controllers/vet_controllers/vetDashboardController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { allowRoles } from '../../middleware/roleMiddleware.js';

const router = express.Router();

// Apply middleware to all routes
router.use(verifyToken);
router.use(allowRoles(2, 3)); // Allow both admin and vet

// Dashboard stats
router.get('/dashboard/stats', getVetDashboardStats);
router.get('/dashboard/appointments-graph', getAppointmentsGraphData);
router.get('/dashboard/todays-appointments', getTodaysAppointments);
router.get('/dashboard/recent-patients', getRecentPatients);
router.get('/dashboard/upcoming-appointments', getUpcomingAppointments);
router.get('/dashboard/recent-activities', getRecentActivities);
router.get('/dashboard/patient-stats', getPatientStats);
router.get('/dashboard/upcoming-appointments-full', getAllUpcomingAppointments);

// Password change
router.post('/change-password', changeVetPassword);

export default router;