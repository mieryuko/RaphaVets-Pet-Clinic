import db from "../config/db.js";
import { getIO } from "../socket.js";

const sendToOnlineUsers = async (userIds, notification) => {
    try {
        console.log('🔍 [sendToOnlineUsers] Starting with userIds:', userIds);
        
        if (!userIds || userIds.length === 0) {
            console.log('⚠️ [sendToOnlineUsers] No userIds provided');
            return;
        }

        // Get active sessions from database
        console.log('🔍 [sendToOnlineUsers] Querying active sessions for users:', userIds);
        const [sessions] = await db.query(
            `SELECT socketID FROM user_websocket_sessions_tbl
             WHERE accID IN (?) AND isActive = 1`,
            [userIds]
        );

        console.log('🔍 [sendToOnlineUsers] Found active sessions:', sessions.length);

        if (sessions.length === 0) {
            console.log('⚠️ [sendToOnlineUsers] No active sessions found');
            return;
        }

        // Get io instance from getIO()
        let io;
        try {
            io = getIO();
            console.log('✅ [sendToOnlineUsers] Got IO instance successfully');
        } catch (error) {
            console.log('⚠️ [sendToOnlineUsers] Socket not initialized yet:', error.message);
            return;
        }

        // Emit to each active session
        sessions.forEach(session => {
            console.log(`🔍 [sendToOnlineUsers] Emitting to socket: ${session.socketID}`);
            io.to(session.socketID).emit("new_notification", notification);
        });

        console.log('✅ [sendToOnlineUsers] Completed successfully');
    } catch (error) {
        console.error("❌ [sendToOnlineUsers] Error:", error);
    }
};

export const createForumPostNotification = async (req, res) => {
    console.log('🔍 [createForumPostNotification] Started');
    
    try {
        const { forumID, accID, postType, description, isAnonymous } = req.body;
        
        // Get post creator's name (if not anonymous)
        let creatorName = "Someone";
        if (!isAnonymous) {
            const [user] = await db.query(
                "SELECT firstName, lastName FROM account_tbl WHERE accId = ?",
                [accID]
            );
            if (user.length) {
                creatorName = `${user[0].firstName} ${user[0].lastName}`;
            }
        }

        // 1. Insert notification
        const [result] = await db.query(
            `INSERT INTO notifications_tbl 
            (notifTypeID, title, message, data, referenceID, referenceTable, targetType, createdBy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                1,
                `New ${postType} Pet`,
                `${creatorName} reported a ${postType.toLowerCase()} pet: ${description.substring(0, 50)}...`,
                JSON.stringify({
                    forumId: forumID,
                    postType: postType,
                    isAnonymous: isAnonymous
                }),
                forumID,
                'forum_posts_tbl',
                'all',
                accID
            ]
        );

        const notificationId = result.insertId;

        // 2. Get ALL users except the creator
        const [users] = await db.query(
            `SELECT accId FROM account_tbl 
             WHERE accId != ? AND isDeleted = 0 AND roleID = 1`,
            [accID]
        );

        // Also check your own user ID from the database
        const [myUser] = await db.query(
            `SELECT accId, email FROM account_tbl WHERE accId = ?`,
            [accID]
        );
        console.log('🔍 [DEBUG] My user info:', myUser[0]);

        // 3. Link notifications to all users
        if (users.length > 0) {
            const userValues = users.map(u => [u.accId, notificationId]);
            await db.query(
                `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES ?`,
                [userValues]
            );
        }

        await db.query(
            `INSERT INTO user_notifications_tbl (accID, notificationID, isRead, readAt) 
             VALUES (?, ?, 1, NOW())`,
            [accID, notificationId]
        );
        console.log('✅ Marked notification as read for creator:', accID);

        // 4. Send to online users via WebSocket - WITH FULL DETAILS
        await sendToOnlineUsers(users.map(u => u.accId), {
            notificationId,
            type: 'forum_update',
            title: `New ${postType} Pet`,
            message: `${creatorName} reported a ${postType.toLowerCase()} pet: ${description.substring(0, 50)}...`,
            fullDescription: description,
            creatorName: creatorName,
            postType: postType,
            createdBy: accID,
            data: { 
                forumId: forumID, 
                postType,
                description: description
            },
            createdAt: new Date()
        });

        // Only send response if this is being called as an API endpoint
        if (res && typeof res.status === 'function') {
            res.status(201).json({ 
                success: true, 
                message: 'Forum notification created',
                notificationId 
            });
        }

    } catch (error) {
        console.error('❌ [createForumPostNotification] Error:', error);
        if (res && typeof res.status === 'function') {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

/**
 * Create notification for pet care tips update - ONLY when new tip is published
 */
export const createPetTipsNotification = async (req, res) => {
    console.log('🔍 [createPetTipsNotification] Started');
    console.log('🔍 [createPetTipsNotification] Request body:', req.body);
    console.log('🔍 [createPetTipsNotification] User:', req.user);

    try {
        const { petCareID, title, shortDescription, pubStatusID, accID } = req.body;

        console.log('🔍 [createPetTipsNotification] pubStatusID:', pubStatusID);

        // Only notify when published
        if (pubStatusID !== 2) { // 2 = Published
            console.log('⚠️ [createPetTipsNotification] Not published, skipping notification');
            return res.status(200).json({ success: true, message: 'Not published, no notification' });
        }

        // 1. Insert notification
        console.log('🔍 [createPetTipsNotification] Inserting into notifications_tbl...');
        const [result] = await db.query(
            `INSERT INTO notifications_tbl 
            (notifTypeID, title, message, data, referenceID, referenceTable, targetType, createdBy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                2, // pet_tips_update
                `New Pet Care Tip`,
                title,
                JSON.stringify({ petCareId: petCareID, shortDescription }),
                petCareID,
                'pet_care_tips_content_tbl',
                'all', // Send to all users
                accID
            ]
        );

        const notificationId = result.insertId;
        console.log('✅ [createPetTipsNotification] Notification inserted with ID:', notificationId);

        // 2. Get ALL clients
        console.log('🔍 [createPetTipsNotification] Fetching all clients...');
        const [users] = await db.query(
            `SELECT accId FROM account_tbl WHERE isDeleted = 0 AND roleID = 1`
        );
        console.log('🔍 [createPetTipsNotification] Found users:', users.length);

        // 3. Link to all users
        if (users.length > 0) {
            console.log('🔍 [createPetTipsNotification] Linking notifications...');
            const userValues = users.map(u => [u.accId, notificationId]);
            await db.query(
                `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES ?`,
                [userValues]
            );
            console.log('✅ [createPetTipsNotification] Notifications linked');
        }

        await sendToOnlineUsers(users.map(u => u.accId), {
            notificationId,
            type: 'pet_tips_update',
            title: `New Pet Care Tip`,
            message: title,
            fullDescription: shortDescription,
            createdBy: accID,
            data: { petCareId: petCareID, shortDescription },
            createdAt: new Date()
        });

        console.log('✅ [createPetTipsNotification] Completed');
        res.status(201).json({ 
            success: true, 
            message: 'Pet tip notification sent to all users',
            notificationId 
        });

    } catch (error) {
        console.error('❌ [createPetTipsNotification] Error:', error);
        console.error('❌ [createPetTipsNotification] Stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Create notification for video update - ONLY when new video is published
 */
export const createVideoNotification = async (req, res) => {
    console.log('🔍 [createVideoNotification] Started');
    console.log('🔍 [createVideoNotification] Request body:', req.body);

    try {
        const { videoID, videoTitle, videoCategoryID, pubStatusID, accID } = req.body;

        if (pubStatusID !== 2) {
            console.log('⚠️ [createVideoNotification] Not published, skipping');
            return res.status(200).json({ success: true, message: 'Not published, no notification' });
        }

        // Get category name
        console.log('🔍 [createVideoNotification] Fetching video category...');
        const [category] = await db.query(
            'SELECT videoCategory FROM video_category_tbl WHERE videoCategoryID = ?',
            [videoCategoryID]
        );
        console.log('🔍 [createVideoNotification] Category:', category[0]);

        console.log('🔍 [createVideoNotification] Inserting notification...');
        const [result] = await db.query(
            `INSERT INTO notifications_tbl 
            (notifTypeID, title, message, data, referenceID, referenceTable, targetType, createdBy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                3, // video_update
                `New Video: ${category[0]?.videoCategory || 'Educational'}`,
                videoTitle,
                JSON.stringify({ videoId: videoID, category: category[0]?.videoCategory }),
                videoID,
                'video_content_tbl',
                'all',
                accID
            ]
        );

        const notificationId = result.insertId;
        console.log('✅ [createVideoNotification] Notification inserted:', notificationId);

        const [users] = await db.query(
            'SELECT accId FROM account_tbl WHERE isDeleted = 0 AND roleID = 1'
        );
        console.log('🔍 [createVideoNotification] Users to notify:', users.length);
        
        if (users.length > 0) {
            const userValues = users.map(u => [u.accId, notificationId]);
            await db.query(
                `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES ?`,
                [userValues]
            );
        }

        await sendToOnlineUsers(users.map(u => u.accId), {
            notificationId,
            type: 'video_update',
            title: `New Video: ${category[0]?.videoCategory || 'Educational'}`,
            message: videoTitle,
            createdBy: accID,
            data: { videoId: videoID, category: category[0]?.videoCategory },
            createdAt: new Date()
        });

        console.log('✅ [createVideoNotification] Completed');
        res.status(201).json({ 
            success: true, 
            message: 'Video notification sent to all users',
            notificationId 
        });

    } catch (error) {
        console.error('❌ [createVideoNotification] Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Create notification for appointment update - ONLY for specific user
 */
export const createAppointmentNotification = async (req, res) => {
    console.log('🔍 [createAppointmentNotification] Started');
    console.log('🔍 [createAppointmentNotification] Request body:', req.body);

    try {
        const { appointmentID, accID, statusID, appointmentDate } = req.body;

        // Get status name
        console.log('🔍 [createAppointmentNotification] Fetching status name...');
        const [status] = await db.query(
            'SELECT statusName FROM appointment_status_tbl WHERE statusID = ?',
            [statusID]
        );
        console.log('🔍 [createAppointmentNotification] Status:', status[0]);

        // 1. Insert notification
        console.log('🔍 [createAppointmentNotification] Inserting notification...');
        const [result] = await db.query(
            `INSERT INTO notifications_tbl 
            (notifTypeID, title, message, data, referenceID, referenceTable, targetType, createdBy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                4, // appointment_update
                `Appointment ${status[0]?.statusName}`,
                `Your appointment for ${new Date(appointmentDate).toLocaleDateString()} is now ${status[0]?.statusName}`,
                JSON.stringify({ 
                    appointmentId: appointmentID, 
                    status: status[0]?.statusName,
                    date: appointmentDate 
                }),
                appointmentID,
                'appointment_tbl',
                'specific',
                req.user?.id || null
            ]
        );

        const notificationId = result.insertId;
        console.log('✅ [createAppointmentNotification] Notification inserted:', notificationId);

        // 2. Link ONLY to the specific user
        console.log('🔍 [createAppointmentNotification] Linking to user:', accID);
        await db.query(
            `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES (?, ?)`,
            [accID, notificationId]
        );

        // 3. Send to user if online
        console.log('🔍 [createAppointmentNotification] Sending to user...');
        await sendToOnlineUsers([accID], {
            notificationId,
            type: 'appointment_update',
            title: `Appointment ${status[0]?.statusName}`,
            message: `Your appointment for ${new Date(appointmentDate).toLocaleDateString()} is now ${status[0]?.statusName}`,
            data: { appointmentId: appointmentID, status: status[0]?.statusName },
            createdAt: new Date()
        });

        console.log('✅ [createAppointmentNotification] Completed');
        res.status(201).json({ 
            success: true, 
            message: 'Appointment notification sent to specific user',
            notificationId 
        });

    } catch (error) {
        console.error('❌ [createAppointmentNotification] Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Create notification for medical/lab record update - ONLY for specific user (pet owner)
 */
export const createMedicalRecordNotification = async (req, res) => {
    console.log('🔍 [createMedicalRecordNotification] Started');
    console.log('🔍 [createMedicalRecordNotification] Request body:', req.body);

    try {
        const { petMedicalID, petID, recordTitle, labTypeID } = req.body;

        // Get pet owner
        console.log('🔍 [createMedicalRecordNotification] Fetching pet owner...');
        const [pet] = await db.query(
            'SELECT accID, petName FROM pet_tbl WHERE petID = ?',
            [petID]
        );

        if (!pet.length) {
            console.log('❌ [createMedicalRecordNotification] Pet not found');
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }
        console.log('🔍 [createMedicalRecordNotification] Pet owner:', pet[0]);

        // Get lab type name
        console.log('🔍 [createMedicalRecordNotification] Fetching lab type...');
        const [labType] = await db.query(
            'SELECT labType FROM labtype_tbl WHERE labType_ID = ?',
            [labTypeID]
        );
        console.log('🔍 [createMedicalRecordNotification] Lab type:', labType[0]);

        const type = labType[0]?.labType || 'Medical Record';
        const typeId = labTypeID === 1 ? 6 : 5;

        // 1. Insert notification
        console.log('🔍 [createMedicalRecordNotification] Inserting notification...');
        const [result] = await db.query(
            `INSERT INTO notifications_tbl 
            (notifTypeID, title, message, data, referenceID, referenceTable, targetType, createdBy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                typeId,
                `New ${type} for ${pet[0].petName}`,
                `${recordTitle} has been added to ${pet[0].petName}'s records`,
                JSON.stringify({ 
                    petMedicalId: petMedicalID, 
                    petId: petID,
                    petName: pet[0].petName,
                    recordTitle,
                    type 
                }),
                petMedicalID,
                'petmedical_tbl',
                'specific',
                req.user?.id || null
            ]
        );

        const notificationId = result.insertId;
        console.log('✅ [createMedicalRecordNotification] Notification inserted:', notificationId);

        // 2. Link ONLY to the pet owner
        console.log('🔍 [createMedicalRecordNotification] Linking to owner:', pet[0].accID);
        await db.query(
            `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES (?, ?)`,
            [pet[0].accID, notificationId]
        );

        // 3. Send to owner if online
        console.log('🔍 [createMedicalRecordNotification] Sending to owner...');
        await sendToOnlineUsers([pet[0].accID], {
            notificationId,
            type: typeId === 5 ? 'medical_record_update' : 'lab_record_update',
            title: `New ${type} for ${pet[0].petName}`,
            message: `${recordTitle} has been added`,
            data: { petMedicalId: petMedicalID, petId: petID, petName: pet[0].petName },
            createdAt: new Date()
        });

        console.log('✅ [createMedicalRecordNotification] Completed');
        res.status(201).json({ 
            success: true, 
            message: 'Medical record notification sent to pet owner',
            notificationId 
        });

    } catch (error) {
        console.error('❌ [createMedicalRecordNotification] Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Get user's notifications (with pagination)
 */
export const getUserNotifications = async (req, res) => {
    console.log('🔍 [getUserNotifications] Started for user:', req.user);
    
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            console.error('❌ [getUserNotifications] No user ID found in request');
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        console.log('🔍 [getUserNotifications] Params:', { userId, page, limit, offset });

        const [notifications] = await db.query(
            `SELECT 
                n.*, 
                n.createdBy,
                un.isRead, 
                un.readAt,
                un.deliveredAt,
                nt.typeName
             FROM notifications_tbl n
             JOIN user_notifications_tbl un ON n.notificationID = un.notificationID
             JOIN notification_type_tbl nt ON n.notifTypeID = nt.notifTypeID
             WHERE un.accID = ? AND un.isDeleted = 0
             
             UNION ALL
             
             SELECT 
                n.*, 
                n.createdBy,
                0 as isRead, 
                NULL as readAt,
                NULL as deliveredAt,
                nt.typeName
             FROM notifications_tbl n
             JOIN notification_type_tbl nt ON n.notifTypeID = nt.notifTypeID
             WHERE n.targetType = 'all' 
             AND n.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
             AND n.notificationID NOT IN (
                 SELECT notificationID FROM user_notifications_tbl 
                 WHERE accID = ? AND isDeleted = 0
             )
             
             ORDER BY createdAt DESC
             LIMIT ? OFFSET ?`,
            [userId, userId, parseInt(limit), parseInt(offset)]
        );

        console.log('🔍 [getUserNotifications] Found notifications:', notifications.length);

        const [totalResult] = await db.query(
            `SELECT COUNT(*) as total FROM (
                SELECT notificationID FROM user_notifications_tbl WHERE accID = ? AND isDeleted = 0
                UNION ALL
                SELECT n.notificationID FROM notifications_tbl n
                WHERE n.targetType = 'all' 
                AND n.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
                AND n.notificationID NOT IN (
                    SELECT notificationID FROM user_notifications_tbl WHERE accID = ?
                )
            ) as combined`,
            [userId, userId]
        );

        console.log('🔍 [getUserNotifications] Total count:', totalResult[0].total);

        res.json({
            success: true,
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalResult[0].total,
                pages: Math.ceil(totalResult[0].total / limit)
            }
        });

    } catch (error) {
        console.error('❌ [getUserNotifications] Error:', error);
        console.error('❌ [getUserNotifications] Stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (req, res) => {
    console.log('🔍 [getUnreadCount] Started for user:', req.user);
    
    try {
        const userId = req.user?.id;
        
        console.log('🔍 [getUnreadCount] Resolved userId:', userId);
        
        if (!userId) {
            console.error('❌ [getUnreadCount] No user ID found in request');
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        console.log('🔍 [getUnreadCount] Fetching unread counts for user:', userId);
        
        const [result] = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM user_notifications_tbl 
                 WHERE accID = ? AND isRead = 0 AND isDeleted = 0) as specific_unread,
                
                (SELECT COUNT(*) FROM notifications_tbl n
                 WHERE n.targetType = 'all' 
                 AND n.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
                 AND NOT EXISTS (
                     SELECT 1 FROM user_notifications_tbl un
                     WHERE un.notificationID = n.notificationID 
                     AND un.accID = ?
                 )) as global_unread`,
            [userId, userId]
        );

        console.log('🔍 [getUnreadCount] Counts:', result[0]);

        const totalUnread = result[0].specific_unread + result[0].global_unread;

        res.json({
            success: true,
            unread: totalUnread,
            breakdown: {
                specific: result[0].specific_unread,
                global: result[0].global_unread
            }
        });

    } catch (error) {
        console.error('❌ [getUnreadCount] Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
    console.log('🔍 [markAsRead] Started for user:', req.user);
    console.log('🔍 [markAsRead] Params:', req.params);
    
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        console.log('🔍 [markAsRead] Marking notification as read:', { userId, notificationId });

        const [result] = await db.query(
            `UPDATE user_notifications_tbl 
             SET isRead = 1, readAt = NOW()
             WHERE accID = ? AND notificationID = ?`,
            [userId, notificationId]
        );

        console.log('🔍 [markAsRead] Update result:', result);

        if (result.affectedRows === 0) {
            console.log('🔍 [markAsRead] Notification not found in user_notifications, checking global...');
            const [globalNotif] = await db.query(
                `SELECT * FROM notifications_tbl 
                 WHERE notificationID = ? AND targetType = 'all'`,
                [notificationId]
            );

            console.log('🔍 [markAsRead] Global notification check:', globalNotif);

            if (globalNotif.length) {
                console.log('🔍 [markAsRead] Inserting as read for user...');
                await db.query(
                    `INSERT INTO user_notifications_tbl (accID, notificationID, isRead, readAt)
                     VALUES (?, ?, 1, NOW())`,
                    [userId, notificationId]
                );
            }
        }

        const [sessions] = await db.query(
            `SELECT socketID FROM user_websocket_sessions_tbl
             WHERE accID = ? AND isActive = 1`,
            [userId]
        );

        console.log('🔍 [markAsRead] Active sessions:', sessions.length);

        const io = getIO();
        sessions.forEach(session => {
            io.to(session.socketID).emit('notification_read', { notificationId });
        });

        console.log('✅ [markAsRead] Completed');
        res.json({ success: true, message: 'Marked as read' });

    } catch (error) {
        console.error('❌ [markAsRead] Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (req, res) => {
    console.log('🔍 [markAllAsRead] Started for user:', req.user);
    
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        console.log('🔍 [markAllAsRead] Updating all user notifications...');
        await db.query(
            `UPDATE user_notifications_tbl 
             SET isRead = 1, readAt = NOW()
             WHERE accID = ? AND isRead = 0`,
            [userId]
        );

        console.log('🔍 [markAllAsRead] Fetching global notifications...');
        const [globalNotifs] = await db.query(
            `SELECT notificationID FROM notifications_tbl n
             WHERE n.targetType = 'all' 
             AND n.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
             AND NOT EXISTS (
                 SELECT 1 FROM user_notifications_tbl un
                 WHERE un.notificationID = n.notificationID 
                 AND un.accID = ?
             )`,
            [userId]
        );

        console.log('🔍 [markAllAsRead] Global notifications to mark:', globalNotifs.length);

        if (globalNotifs.length > 0) {
            console.log('🔍 [markAllAsRead] Inserting global as read...');
            const values = globalNotifs.map(n => [userId, n.notificationID, 1, new Date()]);
            await db.query(
                `INSERT INTO user_notifications_tbl (accID, notificationID, isRead, readAt)
                 VALUES ?`,
                [values]
            );
        }

        const [sessions] = await db.query(
            `SELECT socketID FROM user_websocket_sessions_tbl
             WHERE accID = ? AND isActive = 1`,
            [userId]
        );

        const io = getIO();
        sessions.forEach(session => {
            io.to(session.socketID).emit('all_read');
        });

        console.log('✅ [markAllAsRead] Completed');
        res.json({ success: true, message: 'All marked as read' });

    } catch (error) {
        console.error('❌ [markAllAsRead] Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
    console.log('🔍 [deleteNotification] Started for user:', req.user);
    console.log('🔍 [deleteNotification] Params:', req.params);
    
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        console.log('🔍 [deleteNotification] Deleting notification:', { userId, notificationId });

        await db.query(
            `UPDATE user_notifications_tbl 
             SET isDeleted = 1 
             WHERE accID = ? AND notificationID = ?`,
            [userId, notificationId]
        );

        const [sessions] = await db.query(
            `SELECT socketID FROM user_websocket_sessions_tbl
             WHERE accID = ? AND isActive = 1`,
            [userId]
        );

        const io = getIO();
        sessions.forEach(session => {
            io.to(session.socketID).emit('notification_deleted', { notificationId });
        });

        console.log('✅ [deleteNotification] Completed');
        res.json({ success: true, message: 'Notification deleted' });

    } catch (error) {
        console.error('❌ [deleteNotification] Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ===========================================
// WEBSOCKET SESSION MANAGEMENT
// ===========================================

export const registerSocketSession = async (userId, socketId, userAgent, ipAddress) => {
    console.log('🔍 [registerSocketSession] Registering session:', { userId, socketId, userAgent, ipAddress });
    
    try {
        console.log('🔍 [registerSocketSession] Deactivating old sessions for user:', userId);
        await db.query(
            `UPDATE user_websocket_sessions_tbl 
             SET isActive = 0 
             WHERE accID = ? AND isActive = 1 AND socketID != ?`,
            [userId, socketId]
        );

        console.log('🔍 [registerSocketSession] Inserting/Updating session...');
        const [result] = await db.query(
            `INSERT INTO user_websocket_sessions_tbl 
             (accID, socketID, userAgent, ipAddress, lastPingAt, isActive) 
             VALUES (?, ?, ?, ?, NOW(), 1)
             ON DUPLICATE KEY UPDATE
             lastPingAt = NOW(),
             isActive = 1,
             userAgent = VALUES(userAgent),
             ipAddress = VALUES(ipAddress)`,
            [userId, socketId, userAgent || 'unknown', ipAddress || 'unknown']
        );

        console.log('✅ [registerSocketSession] Session registered successfully', result);
        return true;
    } catch (error) {
        console.error('❌ [registerSocketSession] Error:', error);
        return false;
    }
};

export const updateSessionPing = async (socketId) => {
    console.log('🔍 [updateSessionPing] Updating ping for socket:', socketId);
    
    try {
        await db.query(
            `UPDATE user_websocket_sessions_tbl 
             SET lastPingAt = NOW() 
             WHERE socketID = ? AND isActive = 1`,
            [socketId]
        );
        console.log('✅ [updateSessionPing] Ping updated');
    } catch (error) {
        console.error('❌ [updateSessionPing] Error:', error);
    }
};

export const removeSocketSession = async (socketId) => {
    console.log('🔍 [removeSocketSession] Removing session for socket:', socketId);
    
    try {
        await db.query(
            `UPDATE user_websocket_sessions_tbl 
             SET isActive = 0 
             WHERE socketID = ?`,
            [socketId]
        );
        console.log('✅ [removeSocketSession] Session removed');
    } catch (error) {
        console.error('❌ [removeSocketSession] Error:', error);
    }
};

export const getActiveSessions = async (userId) => {
    try {
        const [sessions] = await db.query(
            `SELECT * FROM user_websocket_sessions_tbl 
             WHERE accID = ? AND isActive = 1`,
            [userId]
        );
        return sessions;
    } catch (error) {
        console.error('❌ [getActiveSessions] Error:', error);
        return [];
    }
};

export const cleanupInactiveSessions = async () => {
    console.log('🔍 [cleanupInactiveSessions] Starting cleanup...');
    
    try {
        const [result] = await db.query(
            `UPDATE user_websocket_sessions_tbl 
             SET isActive = 0 
             WHERE lastPingAt < DATE_SUB(NOW(), INTERVAL 5 MINUTE) 
             AND isActive = 1`
        );
        console.log('✅ [cleanupInactiveSessions] Cleaned up', result.affectedRows, 'sessions');
    } catch (error) {
        console.error('❌ [cleanupInactiveSessions] Error:', error);
    }
};