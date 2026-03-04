import express from 'express';
import {
  getAdminSettingsUsers,
  createAdminSettingsUser,
  updateAdminSettingsUser,
  deleteAdminSettingsUser,
} from '../../controllers/admin_controllers/adminSettingsController.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { allowRoles } from '../../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/users', verifyToken, allowRoles(2, 3), getAdminSettingsUsers);
router.post('/users', verifyToken, allowRoles(2), createAdminSettingsUser);
router.put('/users/:userId', verifyToken, allowRoles(2), updateAdminSettingsUser);
router.delete('/users/:userId', verifyToken, allowRoles(2), deleteAdminSettingsUser);

export default router;
