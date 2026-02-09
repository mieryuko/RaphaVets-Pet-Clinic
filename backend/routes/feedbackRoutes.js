import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
    createFeedback,
    getAllFeedbacks,
    getAverageRating
} from '../controllers/feedbackController.js';

const router = express.Router();
router.post('/', verifyToken, createFeedback);
router.get('/', getAllFeedbacks);
router.get('/average', getAverageRating);

export default router;