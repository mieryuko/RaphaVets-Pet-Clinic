import express from "express";
import { 
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createForumPostNotification,
  createPetTipsNotification,
  createVideoNotification,
  createAppointmentNotification,
  createMedicalRecordNotification
} from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import db from "../config/db.js";

const router = express.Router();

// ===========================================
// USER NOTIFICATION ROUTES
// ===========================================

// Get user's notifications
router.get("/", verifyToken, getUserNotifications);

// Get unread count
router.get("/unread-count", verifyToken, getUnreadCount);

// Mark specific notification as read
router.post("/:notificationId/read", verifyToken, markAsRead);

// Mark all notifications as read
router.post("/mark-all-read", verifyToken, markAllAsRead);

// Delete notification
router.delete("/:notificationId", verifyToken, deleteNotification);

// ===========================================
// TEST ENDPOINT - REMOVE IN PRODUCTION
// ===========================================
router.post("/test", verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id; // CHANGED: accId -> id
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        
        // Check if tables exist
        const [tables] = await db.query("SHOW TABLES LIKE '%notification%'");

        // Insert a test notification
        const [result] = await db.query(
            `INSERT INTO notifications_tbl 
            (notifTypeID, title, message, data, targetType, createdBy) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                1,
                "🐕 Test Notification",
                "This is a test notification to check if system works",
                JSON.stringify({ test: true }),
                'all',
                userId
            ]
        );

        const notificationId = result.insertId;

        // Link to user
        await db.query(
            `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES (?, ?)`,
            [userId, notificationId]
        );

        // Emit via socket
        const io = req.app.get('io');
        io.to(`user_${userId}`).emit('new_notification', {
            notificationId,
            type: 'forum_update',
            title: "🐕 Test Notification",
            message: "This is a test notification",
            data: { test: true },
            createdAt: new Date()
        });
        res.json({ success: true, message: "Test notification created", notificationId });

    } catch (error) {
        console.error('❌ [TEST] Error:', error);
        console.error('❌ [TEST] Stack:', error.stack);
        res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
});

// ===========================================
// NOTIFICATION CREATION ROUTES
// ===========================================

router.post("/forum", verifyToken, createForumPostNotification);

router.post("/pet-tips", verifyToken, createPetTipsNotification);

router.post("/video", verifyToken, createVideoNotification);

router.post("/appointment", verifyToken, createAppointmentNotification);

router.post("/medical-record", verifyToken, createMedicalRecordNotification);

export default router;