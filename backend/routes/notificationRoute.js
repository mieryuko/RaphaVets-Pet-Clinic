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

console.log('🔧 [notificationRoutes] Initializing notification routes...');

// ===========================================
// USER NOTIFICATION ROUTES
// ===========================================

// Get user's notifications
router.get("/", verifyToken, (req, res, next) => {
    console.log('📨 [GET /] Request received for user:', req.user?.id); // CHANGED: accId -> id
    next();
}, getUserNotifications);

// Get unread count
router.get("/unread-count", verifyToken, (req, res, next) => {
    console.log('📨 [GET /unread-count] Request received for user:', req.user?.id); // CHANGED: accId -> id
    next();
}, getUnreadCount);

// Mark specific notification as read
router.post("/:notificationId/read", verifyToken, (req, res, next) => {
    console.log('📨 [POST /:notificationId/read] Request received:', { 
        userId: req.user?.id, // CHANGED: accId -> id
        notificationId: req.params.notificationId 
    });
    next();
}, markAsRead);

// Mark all notifications as read
router.post("/mark-all-read", verifyToken, (req, res, next) => {
    console.log('📨 [POST /mark-all-read] Request received for user:', req.user?.id); // CHANGED: accId -> id
    next();
}, markAllAsRead);

// Delete notification
router.delete("/:notificationId", verifyToken, (req, res, next) => {
    console.log('📨 [DELETE /:notificationId] Request received:', {
        userId: req.user?.id, // CHANGED: accId -> id
        notificationId: req.params.notificationId
    });
    next();
}, deleteNotification);

// ===========================================
// TEST ENDPOINT - REMOVE IN PRODUCTION
// ===========================================
router.post("/test", verifyToken, async (req, res) => {
    console.log('🧪 [TEST] Creating test notification for user:', req.user?.id); // CHANGED: accId -> id
    
    try {
        const userId = req.user?.id; // CHANGED: accId -> id
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        
        // Check if tables exist
        console.log('🧪 [TEST] Checking if notification tables exist...');
        const [tables] = await db.query("SHOW TABLES LIKE '%notification%'");
        console.log('🧪 [TEST] Found tables:', tables.map(t => Object.values(t)[0]));

        // Insert a test notification
        console.log('🧪 [TEST] Inserting test notification...');
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
        console.log('✅ [TEST] Notification inserted with ID:', notificationId);

        // Link to user
        console.log('🧪 [TEST] Linking to user...');
        await db.query(
            `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES (?, ?)`,
            [userId, notificationId]
        );

        // Emit via socket
        console.log('🧪 [TEST] Emitting via socket...');
        const io = req.app.get('io');
        io.to(`user_${userId}`).emit('new_notification', {
            notificationId,
            type: 'forum_update',
            title: "🐕 Test Notification",
            message: "This is a test notification",
            data: { test: true },
            createdAt: new Date()
        });

        console.log('✅ [TEST] Test notification created successfully');
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

router.post("/forum", verifyToken, (req, res, next) => {
    console.log('📨 [POST /forum] Request received:', req.body);
    next();
}, createForumPostNotification);

router.post("/pet-tips", verifyToken, (req, res, next) => {
    console.log('📨 [POST /pet-tips] Request received:', req.body);
    next();
}, createPetTipsNotification);

router.post("/video", verifyToken, (req, res, next) => {
    console.log('📨 [POST /video] Request received:', req.body);
    next();
}, createVideoNotification);

router.post("/appointment", verifyToken, (req, res, next) => {
    console.log('📨 [POST /appointment] Request received:', req.body);
    next();
}, createAppointmentNotification);

router.post("/medical-record", verifyToken, (req, res, next) => {
    console.log('📨 [POST /medical-record] Request received:', req.body);
    next();
}, createMedicalRecordNotification);

console.log('✅ [notificationRoutes] Routes initialized');

export default router;