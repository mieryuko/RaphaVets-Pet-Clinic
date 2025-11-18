import express from 'express';
import {
  getAllPetCareTips,
  getPetCareTipById,
  createPetCareTip,
  updatePetCareTip,
  deletePetCareTip,
  getPetCareCategories,
  getIcons,
  getPublicationStatuses,
  createPetCareCategory,
} from "../../controllers/admin_controllers/contentManagementController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/roleMiddleware.js";
const router = express.Router();

// Public routes
// Public routes
router.get('/pet-care-tips', verifyToken, allowRoles(2, 3), getAllPetCareTips);
router.get('/pet-care-categories', verifyToken, allowRoles(2, 3), getPetCareCategories);
router.get('/icons', verifyToken, allowRoles(2, 3), getIcons);
router.get('/publication-statuses', verifyToken, allowRoles(2, 3), getPublicationStatuses);
router.get('/:id', verifyToken, allowRoles(2, 3), getPetCareTipById);

// Protected routes (Admin only)
// Add this route
router.post('/createCategory', verifyToken, allowRoles(2, 3), createPetCareCategory);
router.post('/createPetCare', verifyToken, allowRoles(2, 3), createPetCareTip);
router.put('/updatePetCare/:id', verifyToken, allowRoles(2, 3), updatePetCareTip);
router.delete('/deletePetCare/:id', verifyToken, allowRoles(2, 3), deletePetCareTip);

export default router;