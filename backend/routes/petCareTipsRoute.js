import express from 'express';
import {
  getAllPetCareTips,
  getCategories,
  getPetCareTipsByCategory,
  searchPetCareTips
} from '../controllers/petCareTipsController.js';

const router = express.Router();

// GET /api/pet-care-tips - Get all pet care tips
router.get('/', getAllPetCareTips);

// GET /api/pet-care-tips/categories - Get available categories
router.get('/categories', getCategories);

// GET /api/pet-care-tips/category/:category - Get tips by category
router.get('/category/:category', getPetCareTipsByCategory);

// GET /api/pet-care-tips/search - Search tips
router.get('/search', searchPetCareTips);

export default router;