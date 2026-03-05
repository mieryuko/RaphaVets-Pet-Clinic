import express from 'express';
import { 
  getVetDashboardStats, 
  changeVetPassword 
} from '../../controllers/vet_controllers/vetDashboardController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { allowRoles } from '../../middleware/roleMiddleware.js';

const router = express.Router();

// All vet routes require authentication and vet role
router.use(verifyToken);
router.use(allowRoles(3)); // roleID 3 = veterinarian

// Get vet dashboard stats (includes name)
router.get('/dashboard/stats', getVetDashboardStats);

// Change vet password
router.post('/change-password', changeVetPassword);

export default router;