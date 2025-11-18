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
} from "../../controllers/admin_controllers/petCareTipsController.js";
import {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoCategories,
  createVideoCategory,
  getPublishedVideos,
  getVideosByCategory,
} from "../../controllers/admin_controllers/videoResourcesController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/roleMiddleware.js";
const router = express.Router();

// Public routes
router.get('/publication-statuses', verifyToken, allowRoles(2, 3), getPublicationStatuses);


router.get('/pet-care-tips', verifyToken, allowRoles(2, 3), getAllPetCareTips);
router.get('/pet-care-categories', verifyToken, allowRoles(2, 3), getPetCareCategories);
router.get('/pet-care-tips/icons', verifyToken, allowRoles(2, 3), getIcons);
router.get('/pet-care-tips/:id', verifyToken, allowRoles(2, 3), getPetCareTipById);

// Protected routes (Admin only)
// Add this route
router.post('/pet-care-tips/createCategory', verifyToken, allowRoles(2, 3), createPetCareCategory);
router.post('/pet-care-tips/createPetCare', verifyToken, allowRoles(2, 3), createPetCareTip);
router.put('/pet-care-tips/updatePetCare/:id', verifyToken, allowRoles(2, 3), updatePetCareTip);
router.delete('/pet-care-tips/deletePetCare/:id', verifyToken, allowRoles(2, 3), deletePetCareTip);

//VIDEOS
// Public routes (for frontend display)
router.get('/videos/published', getPublishedVideos);
router.get('/videos/category/:categoryId', getVideosByCategory);

// Protected routes (Admin only)
router.get('/videos/videos', verifyToken, allowRoles(2, 3), getAllVideos);
router.get('/videos/categories', verifyToken, allowRoles(2, 3), getVideoCategories);
router.get('/videos/:id', verifyToken, allowRoles(2, 3), getVideoById);
router.post('/videos/create', verifyToken, allowRoles(2, 3), createVideo);
router.post('/videos/createCategory', verifyToken, allowRoles(2, 3), createVideoCategory);
router.put('/videos/update/:id', verifyToken, allowRoles(2, 3), updateVideo);
router.delete('/videos/delete/:id', verifyToken, allowRoles(2, 3), deleteVideo);

export default router;