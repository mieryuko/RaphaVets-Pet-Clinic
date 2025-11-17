import express from 'express';
import {
  getAllVideos,
  getVideosByCategory,
  getVideoCategories,
  searchVideos
} from '../controllers/videoController.js';

const router = express.Router();

// GET /api/videos - Get all videos
router.get('/', getAllVideos);

// GET /api/videos/categories - Get available categories
router.get('/categories', getVideoCategories);

// GET /api/videos/category/:category - Get videos by category
router.get('/category/:category', getVideosByCategory);

// GET /api/videos/search - Search videos
router.get('/search', searchVideos);

export default router;