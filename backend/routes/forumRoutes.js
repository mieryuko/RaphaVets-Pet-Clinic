import express from 'express';
import path from 'path';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createMulter } from '../middleware/multer.js';
import {
    createPost,
    getAllPosts
} from '../controllers/forumController.js';

const router = express.Router();
const upload = createMulter('forum', ['image/jpeg', 'image/png', 'image/webp'], 10); // Allow images up to 10MB

router.post('/', verifyToken, upload.array('image', 5), createPost);
router.get('/', getAllPosts);

router.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(process.cwd(), '..', 'uploads/forum', filename);
    res.sendFile(imagePath, err => {
        if (err) {
            res.status(404).send('Image not found' + err.message);
        }
    });
});
export default router;