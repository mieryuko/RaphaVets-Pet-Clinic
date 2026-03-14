import db from "../config/db.js";
import { getIO } from "../socket.js";
import {
    getDefaultFromAddress,
    isResendConfigured,
    sendResendEmail,
} from "../utils/resendEmail.js";

const sendAppointmentUpdateEmail = async ({
    accID,
    petName,
    service,
    formattedDate,
    statusName,
}) => {
    try {
        if (!accID || !isResendConfigured()) return;

        const [users] = await db.query(
            "SELECT firstName, email FROM account_tbl WHERE accID = ? LIMIT 1",
            [accID]
        );

        if (!users.length || !users[0].email) return;

        const recipient = users[0].email;
        const firstName = users[0].firstName || "Pet Owner";
        const safePetName = petName || "your pet";
        const safeService = service || "clinic service";
        const safeStatus = statusName || "Updated";
        const safeDate = formattedDate || "your scheduled date";

        await sendResendEmail({
            from: getDefaultFromAddress(),
            to: recipient,
            subject: `Appointment ${safeStatus} - RaphaVets Pet Clinic`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
                <h2 style="margin-bottom: 16px;">Appointment Update</h2>
                <p>Hello ${firstName},</p>
                <p>Your appointment for <strong>${safePetName}</strong> has been updated.</p>
                <ul style="padding-left: 18px;">
                  <li><strong>Service:</strong> ${safeService}</li>
                  <li><strong>Date:</strong> ${safeDate}</li>
                  <li><strong>Status:</strong> ${safeStatus}</li>
                </ul>
                <p>Please check your RaphaVets account for full details.</p>
                <p style="margin-top: 24px;">RaphaVets Pet Clinic</p>
              </div>
            `,
        });
    } catch (emailError) {
        console.error("Failed to send appointment update email:", emailError);
    }
};

const sendPetRecordUpdateEmail = async ({
    accID,
    petName,
    recordTitle,
    recordType,
}) => {
    try {
        if (!accID || !isResendConfigured()) return;

        const [users] = await db.query(
            "SELECT firstName, email FROM account_tbl WHERE accID = ? LIMIT 1",
            [accID]
        );

        if (!users.length || !users[0].email) return;

        const recipient = users[0].email;
        const firstName = users[0].firstName || "Pet Owner";
        const safePetName = petName || "your pet";
        const safeRecordTitle = recordTitle || "A new record";
        const safeRecordType = recordType || "Medical Record";

        await sendResendEmail({
            from: getDefaultFromAddress(),
            to: recipient,
            subject: `New ${safeRecordType} for ${safePetName} - RaphaVets Pet Clinic`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
                <h2 style="margin-bottom: 16px;">Pet Record Update</h2>
                <p>Hello ${firstName},</p>
                <p>A new <strong>${safeRecordType}</strong> has been uploaded for <strong>${safePetName}</strong>.</p>
                <ul style="padding-left: 18px;">
                  <li><strong>Record:</strong> ${safeRecordTitle}</li>
                  <li><strong>Pet:</strong> ${safePetName}</li>
                  <li><strong>Type:</strong> ${safeRecordType}</li>
                </ul>
                <p>Please check your RaphaVets account to view full details.</p>
                <p style="margin-top: 24px;">RaphaVets Pet Clinic</p>
              </div>
            `,
        });
    } catch (emailError) {
        console.error("Failed to send pet record update email:", emailError);
    }
};

const shouldNotifyUser = async (userId, notifType) => {
    try {
        // notifType can be: 'forum', 'pet_tips', 'video', 'appointment', 'medical', 'lab'
        const [pref] = await db.query(
            `SELECT * FROM userpreference_tbl WHERE accId = ?`,
            [userId]
        );
        
        if (pref.length === 0) {
            return true; // Default to true if no preferences set
        }

        switch(notifType) {
            case 'forum':
                return pref[0].forumPost === 1;
            case 'pet_tips':
                return pref[0].petCareTips === 1;
            case 'video':
                return pref[0].petVideos === 1;
            case 'appointment':
                return pref[0].appointmentReminders === 1;
            case 'medical':
                return pref[0].petHealthUpd === 1;
            case 'lab':
                return pref[0].petHealthUpd === 1;
            default:
                return true;
        }
    } catch (error) {
        console.error('❌ [shouldNotifyUser] Error checking preferences:', error);
        return true; // Default to true on error to prevent notification loss
    }
};

// Helper function to filter users based on preferences
const filterUsersByPreference = async (userIds, notifType) => {
    if (!userIds || userIds.length === 0) return [];
    
    try {
        const filteredUsers = [];
        
        for (const userId of userIds) {
            const shouldNotify = await shouldNotifyUser(userId, notifType);
            if (shouldNotify) {
                filteredUsers.push(userId);
            }
        }
        
        return filteredUsers;
    } catch (error) {
        console.error('❌ [filterUsersByPreference] Error:', error);
        return userIds; // Return original on error
    }
};

const sendToOnlineUsers = async (userIds, notification, notifType) => {
    try {
        if (!userIds || userIds.length === 0) {
            return;
        }

        // Filter users based on preferences
        const filteredUserIds = await filterUsersByPreference(userIds, notifType);
        
        if (filteredUserIds.length === 0) {
            return;
        }

        // Get active sessions from database for filtered users
        const [sessions] = await db.query(
            `SELECT socketID FROM user_websocket_sessions_tbl
             WHERE accID IN (?) AND isActive = 1`,
            [filteredUserIds]
        );

        if (sessions.length === 0) {
            return;
        }

        // Get io instance from getIO()
        let io;
        try {
            io = getIO();
        } catch (error) {
            return;
        }

        // Emit to each active session
        sessions.forEach(session => {
            io.to(session.socketID).emit("new_notification", notification);
        });
    } catch (error) {
        console.error("❌ [sendToOnlineUsers] Error:", error);
    }
};

const emitUnreadCountForUsers = async (userIds) => {
    try {
        if (!userIds || userIds.length === 0) return;

        const uniqueUserIds = [...new Set(userIds.map(id => parseInt(id)).filter(Boolean))];
        if (uniqueUserIds.length === 0) return;

        let io;
        try {
            io = getIO();
        } catch (socketError) {
            return;
        }

        for (const userId of uniqueUserIds) {
            const [result] = await db.query(
                `SELECT 
                    (SELECT COUNT(*) FROM user_notifications_tbl 
                     WHERE accID = ? AND isRead = 0 AND isDeleted = 0) as specific_unread,
                    (SELECT COUNT(*) FROM notifications_tbl n
                     JOIN account_tbl a ON a.accId = ?
                     WHERE n.targetType = 'all' 
                     AND n.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
                     AND n.createdAt >= a.createdAt
                     AND NOT EXISTS (
                         SELECT 1 FROM user_notifications_tbl un
                         WHERE un.notificationID = n.notificationID 
                         AND un.accID = ?
                     )) as global_unread`,
                [userId, userId, userId]
            );

            const unread = (result[0]?.specific_unread || 0) + (result[0]?.global_unread || 0);

            const [sessions] = await db.query(
                `SELECT socketID FROM user_websocket_sessions_tbl
                 WHERE accID = ? AND isActive = 1`,
                [userId]
            );

            sessions.forEach(session => {
                io.to(session.socketID).emit('unread_count_update', { unread });
            });
        }
    } catch (error) {
        console.error('❌ [emitUnreadCountForUsers] Error:', error);
    }
};

export const removeNotificationsByReference = async (referenceTable, referenceID) => {
    try {
        if (!referenceTable || !referenceID) {
            return { success: false, removedCount: 0, message: 'Missing reference info' };
        }

        const [notifications] = await db.query(
            `SELECT notificationID FROM notifications_tbl
             WHERE referenceTable = ? AND referenceID = ?`,
            [referenceTable, referenceID]
        );

        if (!notifications.length) {
            return { success: true, removedCount: 0 };
        }

        const notificationIds = notifications.map(n => n.notificationID);

        const [recipients] = await db.query(
            `SELECT DISTINCT accID FROM user_notifications_tbl
             WHERE notificationID IN (?) AND isDeleted = 0`,
            [notificationIds]
        );

        await db.query(
            `UPDATE user_notifications_tbl
             SET isDeleted = 1
             WHERE notificationID IN (?)`,
            [notificationIds]
        );

        await db.query(
            `UPDATE notifications_tbl
             SET targetType = 'specific'
             WHERE notificationID IN (?)`,
            [notificationIds]
        );

        if (recipients.length > 0) {
            const recipientIds = recipients.map(r => r.accID);

            const [sessions] = await db.query(
                `SELECT socketID FROM user_websocket_sessions_tbl
                 WHERE accID IN (?) AND isActive = 1`,
                [recipientIds]
            );

            if (sessions.length > 0) {
                let io;
                try {
                    io = getIO();
                } catch (socketError) {
                    return { success: true, removedCount: notificationIds.length };
                }

                sessions.forEach(session => {
                    notificationIds.forEach(notificationId => {
                        io.to(session.socketID).emit('notification_deleted', { notificationId });
                    });
                });
            }
        }

        await emitUnreadCountForUsers(recipients.map(r => r.accID));

        return { success: true, removedCount: notificationIds.length, notificationIds };
    } catch (error) {
        console.error('❌ [removeNotificationsByReference] Error:', error);
        return { success: false, removedCount: 0, error: error.message };
    }
};

export const createForumPostNotification = async (req, res) => {
    
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
                    isAnonymous: isAnonymous,
                    description: description
                }),
                forumID,
                'forum_posts_tbl',
                'specific',
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

        const preferredUserIds = await filterUsersByPreference(
            users.map(u => u.accId),
            'forum'
        );

        // 3. Link notifications only to users who allow forum notifications
        if (preferredUserIds.length > 0) {
            const userValues = preferredUserIds.map(userId => [userId, notificationId]);
            await db.query(
                `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES ?`,
                [userValues]
            );
        }

        // Mark as read for creator
        await db.query(
            `INSERT INTO user_notifications_tbl (accID, notificationID, isRead, readAt) 
             VALUES (?, ?, 1, NOW())`,
            [accID, notificationId]
        );

        // 4. Send to online users via WebSocket
        await sendToOnlineUsers(preferredUserIds, {
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
        }, 'forum');

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

    try {
        const { petCareID, title, shortDescription, pubStatusID, accID } = req.body;


        // Only notify when published
        if (pubStatusID !== 2) { // 2 = Published
            return res.status(200).json({ success: true, message: 'Not published, no notification' });
        }

        // 1. Insert notification
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
                'specific',
                accID
            ]
        );

        const notificationId = result.insertId;

        // 2. Get ALL clients
        const [users] = await db.query(
            `SELECT accId FROM account_tbl WHERE isDeleted = 0 AND roleID = 1`
        );

        const preferredUserIds = await filterUsersByPreference(
            users.map(u => u.accId),
            'pet_tips'
        );

        // 3. Link only to users who allow pet tips notifications
        if (preferredUserIds.length > 0) {
            const userValues = preferredUserIds.map(userId => [userId, notificationId]);
            await db.query(
                `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES ?`,
                [userValues]
            );
        }

        await sendToOnlineUsers(preferredUserIds, {
            notificationId,
            type: 'pet_tips_update',
            title: `New Pet Care Tip`,
            message: title,
            fullDescription: shortDescription,
            createdBy: accID,
            data: { petCareId: petCareID, shortDescription },
            createdAt: new Date()
        }, 'pet_tips');

        res.status(201).json({ 
            success: true, 
            message: 'Pet tip notification sent based on user preferences',
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

    try {
        const { videoID, videoTitle, videoCategoryID, pubStatusID, accID } = req.body;

        if (pubStatusID !== 2) {
            return res.status(200).json({ success: true, message: 'Not published, no notification' });
        }

        // Get category name
        const [category] = await db.query(
            'SELECT videoCategory FROM video_category_tbl WHERE videoCategoryID = ?',
            [videoCategoryID]
        );

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
                'specific',
                accID
            ]
        );

        const notificationId = result.insertId;

        const [users] = await db.query(
            'SELECT accId FROM account_tbl WHERE isDeleted = 0 AND roleID = 1'
        );

        const preferredUserIds = await filterUsersByPreference(
            users.map(u => u.accId),
            'video'
        );
        
        if (preferredUserIds.length > 0) {
            const userValues = preferredUserIds.map(userId => [userId, notificationId]);
            await db.query(
                `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES ?`,
                [userValues]
            );
        }

        await sendToOnlineUsers(preferredUserIds, {
            notificationId,
            type: 'video_update',
            title: `New Video: ${category[0]?.videoCategory || 'Educational'}`,
            message: videoTitle,
            createdBy: accID,
            data: { videoId: videoID, category: category[0]?.videoCategory },
            createdAt: new Date()
        }, 'video');

        res.status(201).json({ 
            success: true, 
            message: 'Video notification sent based on user preferences',
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
    try {
        const { appointmentID, accID, statusID, appointmentDate } = req.body;

        // Get status name
        const [status] = await db.query(
            'SELECT statusName FROM appointment_status_tbl WHERE statusID = ?',
            [statusID]
        );

        // Get appointment details including pet name
        const [appointmentDetails] = await db.query(
            `SELECT a.*, a.petID AS petId, p.petName, s.service
             FROM appointment_tbl a
             JOIN pet_tbl p ON a.petID = p.petID
             JOIN service_tbl s ON a.serviceID = s.serviceID
             WHERE a.appointmentID = ?`,
            [appointmentID]
        );

        if (!appointmentDetails.length) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        const appointment = appointmentDetails[0];
        const resolvedPetId = appointment.petId ?? appointment.petID ?? null;
        const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        // Format status for display (lowercase)
        const statusDisplay = status[0]?.statusName.toLowerCase();
        const statusName = status[0]?.statusName || "Updated";

        // Check if user wants appointment notifications
        const shouldNotify = await shouldNotifyUser(accID, 'appointment');
        
        if (!shouldNotify) {
            return res.status(200).json({ 
                success: true, 
                message: 'User has disabled appointment notifications' 
            });
        }

        await sendAppointmentUpdateEmail({
            accID,
            petName: appointment.petName,
            service: appointment.service,
            formattedDate,
            statusName,
        });

        // 1. Insert notification
        const [result] = await db.query(
            `INSERT INTO notifications_tbl 
            (notifTypeID, title, message, data, referenceID, referenceTable, targetType, createdBy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                4, // appointment_update
                `Appointment ${status[0]?.statusName}`,
                `Your appointment for ${appointment.petName} on ${formattedDate} has been updated to ${statusDisplay}`,
                JSON.stringify({ 
                    appointmentId: appointmentID, 
                    petId: resolvedPetId,
                    petName: appointment.petName,
                    service: appointment.service,
                    status: statusName,
                    date: appointmentDate,
                    formattedDate: formattedDate
                }),
                appointmentID,
                'appointment_tbl',
                'specific',
                req.user?.id || null
            ]
        );

        const notificationId = result.insertId;

        // 2. Link ONLY to the specific user
        await db.query(
            `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES (?, ?)`,
            [accID, notificationId]
        );

        // 3. Send to user if online (already filtered by preference)
        await sendToOnlineUsers([accID], {
            notificationId,
            type: 'appointment_update',
            title: `Appointment ${statusName}`,
            message: `Your appointment for ${appointment.petName} on ${formattedDate} has been ${statusDisplay}`,
            data: { 
                appointmentId: appointmentID, 
                petId: resolvedPetId,
                petName: appointment.petName,
                service: appointment.service,
                status: statusName,
                date: appointmentDate,
                formattedDate: formattedDate
            },
            createdAt: new Date()
        }, 'appointment');
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

    try {
        const { petMedicalID, petID, recordTitle, labTypeID } = req.body;

        // Get pet owner
        const [pet] = await db.query(
            'SELECT accID, petName FROM pet_tbl WHERE petID = ?',
            [petID]
        );

        if (!pet.length) {
            return res.status(404).json({ success: false, message: 'Pet not found' });
        }

        // Get lab type name
        const [labType] = await db.query(
            'SELECT labType FROM labtype_tbl WHERE labType_ID = ?',
            [labTypeID]
        );

        const type = labType[0]?.labType || 'Medical Record';
        const typeId = labTypeID === 1 ? 6 : 5;
        const notifyPreferenceType = typeId === 5 ? 'medical' : 'lab';

        // Check if user wants medical/lab record notifications
        const shouldNotify = await shouldNotifyUser(pet[0].accID, notifyPreferenceType);
        
        if (!shouldNotify) {
            return res.status(200).json({ 
                success: true, 
                message: 'User has disabled pet health update notifications' 
            });
        }

        await sendPetRecordUpdateEmail({
            accID: pet[0].accID,
            petName: pet[0].petName,
            recordTitle,
            recordType: type,
        });

        // 1. Insert notification
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

        // 2. Link ONLY to the pet owner
        await db.query(
            `INSERT INTO user_notifications_tbl (accID, notificationID) VALUES (?, ?)`,
            [pet[0].accID, notificationId]
        );

        // 3. Send to owner if online
        await sendToOnlineUsers([pet[0].accID], {
            notificationId,
            type: typeId === 5 ? 'medical_record_update' : 'lab_record_update',
            title: `New ${type} for ${pet[0].petName}`,
            message: `${recordTitle} has been added`,
            data: { petMedicalId: petMedicalID, petId: petID, petName: pet[0].petName },
            createdAt: new Date()
        }, notifyPreferenceType);

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
             JOIN account_tbl a ON a.accId = ?
             WHERE n.targetType = 'all' 
             AND n.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
             AND n.createdAt >= a.createdAt
             AND n.notificationID NOT IN (
                 SELECT notificationID FROM user_notifications_tbl 
                 WHERE accID = ? AND isDeleted = 0
             )
             
             ORDER BY createdAt DESC
             LIMIT ? OFFSET ?`,
            [userId, userId, userId, parseInt(limit), parseInt(offset)]
        );


        const [totalResult] = await db.query(
            `SELECT COUNT(*) as total FROM (
                SELECT notificationID FROM user_notifications_tbl WHERE accID = ? AND isDeleted = 0
                UNION ALL
                SELECT n.notificationID FROM notifications_tbl n
                JOIN account_tbl a ON a.accId = ?
                WHERE n.targetType = 'all' 
                AND n.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
                AND n.createdAt >= a.createdAt
                AND n.notificationID NOT IN (
                    SELECT notificationID FROM user_notifications_tbl WHERE accID = ?
                )
            ) as combined`,
            [userId, userId, userId]
        );


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
    
    try {
        const userId = req.user?.id;
        
        
        if (!userId) {
            console.error('❌ [getUnreadCount] No user ID found in request');
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        
        const [result] = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM user_notifications_tbl 
                 WHERE accID = ? AND isRead = 0 AND isDeleted = 0) as specific_unread,
                
                (SELECT COUNT(*) FROM notifications_tbl n
                 JOIN account_tbl a ON a.accId = ?
                 WHERE n.targetType = 'all' 
                 AND n.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
                 AND n.createdAt >= a.createdAt
                 AND NOT EXISTS (
                     SELECT 1 FROM user_notifications_tbl un
                     WHERE un.notificationID = n.notificationID 
                     AND un.accID = ?
                 )) as global_unread`,
            [userId, userId, userId]
        );


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
    
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }


        const [result] = await db.query(
            `UPDATE user_notifications_tbl 
             SET isRead = 1, readAt = NOW()
             WHERE accID = ? AND notificationID = ?`,
            [userId, notificationId]
        );


        if (result.affectedRows === 0) {
            const [globalNotif] = await db.query(
                `SELECT n.* FROM notifications_tbl n
                 JOIN account_tbl a ON a.accId = ?
                 WHERE n.notificationID = ? 
                 AND n.targetType = 'all'
                 AND n.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
                 AND n.createdAt >= a.createdAt`,
                [userId, notificationId]
            );


            if (globalNotif.length) {
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


        const io = getIO();
        sessions.forEach(session => {
            io.to(session.socketID).emit('notification_read', { notificationId });
        });

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
    
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        await db.query(
            `UPDATE user_notifications_tbl 
             SET isRead = 1, readAt = NOW()
             WHERE accID = ? AND isRead = 0`,
            [userId]
        );

        const [globalNotifs] = await db.query(
            `SELECT notificationID FROM notifications_tbl n
             JOIN account_tbl a ON a.accId = ?
             WHERE n.targetType = 'all' 
             AND n.createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)
             AND n.createdAt >= a.createdAt
             AND NOT EXISTS (
                 SELECT 1 FROM user_notifications_tbl un
                 WHERE un.notificationID = n.notificationID 
                 AND un.accID = ?
             )`,
            [userId, userId]
        );


        if (globalNotifs.length > 0) {
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
    
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }


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

        await emitUnreadCountForUsers([userId]);

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
    
    try {
        await db.query(
            `UPDATE user_websocket_sessions_tbl 
             SET isActive = 0 
             WHERE accID = ? AND isActive = 1 AND socketID != ?`,
            [userId, socketId]
        );

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

        return true;
    } catch (error) {
        console.error('❌ [registerSocketSession] Error:', error);
        return false;
    }
};

export const updateSessionPing = async (socketId) => {
    
    try {
        await db.query(
            `UPDATE user_websocket_sessions_tbl 
             SET lastPingAt = NOW() 
             WHERE socketID = ? AND isActive = 1`,
            [socketId]
        );
    } catch (error) {
        console.error('❌ [updateSessionPing] Error:', error);
    }
};

export const removeSocketSession = async (socketId) => {
    
    try {
        await db.query(
            `UPDATE user_websocket_sessions_tbl 
             SET isActive = 0 
             WHERE socketID = ?`,
            [socketId]
        );
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
    
    try {
        const [result] = await db.query(
            `UPDATE user_websocket_sessions_tbl 
             SET isActive = 0 
             WHERE lastPingAt < DATE_SUB(NOW(), INTERVAL 5 MINUTE) 
             AND isActive = 1`
        );
    } catch (error) {
        console.error('❌ [cleanupInactiveSessions] Error:', error);
    }
};
