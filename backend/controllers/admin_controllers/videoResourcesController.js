//VIDEOS
import db from "../../config/db.js";
import { createVideoNotification } from "../notificationController.js"; // Import notification function
import { getIO } from "../../socket.js"; // Add this import

// Helper function to extract YouTube video ID
const extractVideoId = (url) => {
  if (!url) return '';
  
  if (url.includes('youtube.com/watch?v=')) {
    return url.split('v=')[1]?.split('&')[0] || '';
  } else if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/embed/')) {
    return url.split('embed/')[1]?.split('?')[0] || '';
  } else {
    return url; // Assume it's already a video ID
  }
};

// Helper function to format video for client
const formatVideoForClient = (video) => ({
  id: extractVideoId(video.videoURL),
  title: video.videoTitle || video.title,
  category: video.category || video.videoCategory,
  url: video.videoURL,
  created_at: video.created_at || new Date().toISOString(),
  updated_at: video.updated_at || new Date().toISOString()
});

export const getAllVideos = async (req, res) => {
  try {
    const query = `
      SELECT 
        v.videoID as id,
        v.videoTitle as title,
        v.videoURL,
        vc.videoCategory as category,
        ps.pubStatus as status,
        CONCAT(a.firstName, ' ', a.lastName) as author_name,
        v.createdAt as created_at,
        v.lastUpdated as updated_at
      FROM video_content_tbl v
      LEFT JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
      LEFT JOIN publication_status_tbl ps ON v.pubStatusID = ps.pubStatsID
      LEFT JOIN account_tbl a ON v.accID = a.accId
      WHERE v.isDeleted = 0
      ORDER BY v.lastUpdated DESC
    `;

    const [results] = await db.execute(query);

    res.json({
      success: true,
      data: results,
      count: results.length
    });

  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos',
      error: error.message
    });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        v.videoID as id,
        v.videoTitle as title,
        v.videoURL,
        vc.videoCategory as category,
        vc.videoCategoryID,
        ps.pubStatus as status,
        ps.pubStatsID,
        CONCAT(a.firstName, ' ', a.lastName) as author_name,
        v.accID,
        v.createdAt as created_at,
        v.lastUpdated as updated_at
      FROM video_content_tbl v
      LEFT JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
      LEFT JOIN publication_status_tbl ps ON v.pubStatusID = ps.pubStatsID
      LEFT JOIN account_tbl a ON v.accID = a.accId
      WHERE v.videoID = ? AND v.isDeleted = 0
    `;

    const [results] = await db.execute(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video',
      error: error.message
    });
  }
};

export const createVideo = async (req, res) => {
  try {
    // Get accID from authenticated user
    const accID = req.user?.accId || req.user?.id;

    if (!accID) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const {
      videoTitle,
      videoURL,
      videoCategoryID,
      pubStatusID = 1 // Default to Draft if not provided
    } = req.body;

    // Validate required fields
    if (!videoTitle || !videoURL || !videoCategoryID) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: videoTitle, videoURL, videoCategoryID'
      });
    }

    // Validate YouTube URL format
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(videoURL)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid YouTube URL'
      });
    }

    const query = `
      INSERT INTO video_content_tbl 
        (accID, videoTitle, videoCategoryID, videoURL, pubStatusID)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      accID,
      videoTitle,
      parseInt(videoCategoryID),
      videoURL,
      parseInt(pubStatusID)
    ]);

    // Fetch the created record to return complete data
    const [newRecord] = await db.execute(
      `SELECT v.videoID as id, v.videoTitle as title, v.videoURL, 
              vc.videoCategory as category, ps.pubStatus as status, v.pubStatusID
       FROM video_content_tbl v
       LEFT JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
       LEFT JOIN publication_status_tbl ps ON v.pubStatusID = ps.pubStatsID
       WHERE v.videoID = ?`,
      [result.insertId]
    );

    // ===========================================
    // 🔔 TRIGGER NOTIFICATION AND WEBSOCKET if published immediately
    // ===========================================
    if (parseInt(pubStatusID) === 2) { // 2 = Published
      try {
        console.log('🔔 [createVideo] Triggering notification for new video');
        
        const notifReq = {
          body: {
            videoID: result.insertId,
            videoTitle: videoTitle,
            videoCategoryID: parseInt(videoCategoryID),
            pubStatusID: parseInt(pubStatusID),
            accID: accID
          },
          user: req.user
        };
        
        const notifRes = {
          status: (code) => ({
            json: (data) => {
              console.log(`🔔 [createVideo] Notification response (${code}):`, data);
            }
          })
        };

        await createVideoNotification(notifReq, notifRes);
        console.log('✅ [createVideo] Notification triggered successfully');
        
        // 🌐 WEBSOCKET EMISSION
        const io = getIO();
        const formattedVideo = formatVideoForClient({
          ...newRecord[0],
          videoTitle,
          videoURL
        });
        
        // Emit to all connected users
        io.emit('new_video', formattedVideo);
        
        // Emit to admin room for other admins
        io.to('admin-room').emit('admin_video_created', {
          video: formattedVideo,
          adminName: req.user?.name || 'Another Admin',
          adminId: accID,
          timestamp: new Date()
        });
        
        console.log('✅ [createVideo] WebSocket events emitted');
        
      } catch (notifError) {
        console.error('⚠️ [createVideo] Failed to send notification:', notifError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: newRecord[0]
    });

  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create video',
      error: error.message
    });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      videoTitle,
      videoURL,
      videoCategoryID,
      pubStatusID
    } = req.body;

    console.log('========== UPDATE VIDEO DEBUG ==========');
    console.log('1. Update request received for video ID:', id);
    console.log('2. Request body:', { videoTitle, videoURL, videoCategoryID, pubStatusID });

    // First, get the current record to check if status is changing
    const [currentRecord] = await db.execute(
      `SELECT pubStatusID, videoTitle, videoCategoryID, videoURL, accID 
       FROM video_content_tbl 
       WHERE videoID = ? AND isDeleted = 0`,
      [id]
    );

    if (currentRecord.length === 0) {
      console.log('❌ Video not found');
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    console.log('3. Current record in DB:', {
      pubStatusID: currentRecord[0].pubStatusID,
      videoTitle: currentRecord[0].videoTitle,
      status: currentRecord[0].pubStatusID === 2 ? 'Published' : 
              currentRecord[0].pubStatusID === 1 ? 'Draft' : 'Archived'
    });

    const wasPublished = currentRecord[0].pubStatusID === 2;
    const willBePublished = pubStatusID !== undefined ? parseInt(pubStatusID) === 2 : wasPublished;
    const isChangingToPublished = !wasPublished && willBePublished;
    const isPublishedUpdate = wasPublished && willBePublished;
    const isUnpublished = wasPublished && pubStatusID !== undefined && parseInt(pubStatusID) !== 2;

    console.log('4. Status change analysis:', {
      wasPublished,
      willBePublished,
      isChangingToPublished,
      isPublishedUpdate,
      isUnpublished,
      newStatus: pubStatusID,
      newStatusText: pubStatusID === 2 ? 'Published' : pubStatusID === 1 ? 'Draft' : 'Archived'
    });

    // Build dynamic query based on provided fields
    let query = `UPDATE video_content_tbl SET `;
    const updates = [];
    const params = [];

    if (videoTitle !== undefined) {
      updates.push('videoTitle = ?');
      params.push(videoTitle);
    }
    if (videoURL !== undefined) {
      // Validate YouTube URL if provided
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
      if (!youtubeRegex.test(videoURL)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid YouTube URL'
        });
      }
      updates.push('videoURL = ?');
      params.push(videoURL);
    }
    if (videoCategoryID !== undefined) {
      updates.push('videoCategoryID = ?');
      params.push(parseInt(videoCategoryID));
    }
    if (pubStatusID !== undefined) {
      updates.push('pubStatusID = ?');
      params.push(parseInt(pubStatusID));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('lastUpdated = CURRENT_TIMESTAMP');
    query += updates.join(', ') + ' WHERE videoID = ? AND isDeleted = 0';
    params.push(parseInt(id));

    console.log('5. Executing update query:', query);
    console.log('6. Query params:', params);

    const [result] = await db.execute(query, params);

    console.log('7. Update result:', result);

    if (result.affectedRows === 0) {
      console.log('❌ No rows affected - video not found or already deleted');
      return res.status(404).json({
        success: false,
        message: 'Video not found or already deleted'
      });
    }

    // Fetch updated record
    const [updatedRecord] = await db.execute(
      `SELECT v.videoID as id, v.videoTitle as title, v.videoURL, 
              vc.videoCategory as category, ps.pubStatus as status, v.pubStatusID
       FROM video_content_tbl v
       LEFT JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
       LEFT JOIN publication_status_tbl ps ON v.pubStatusID = ps.pubStatsID
       WHERE v.videoID = ?`,
      [id]
    );

    console.log('8. Updated record:', updatedRecord[0]);

    // ===========================================
    // 🔔 TRIGGER NOTIFICATION AND WEBSOCKET for all status changes
    // ===========================================
    if (isChangingToPublished || isPublishedUpdate || isUnpublished) {
      console.log('9. 🔔 Entering WebSocket emission block');
      
      try {
        if (isChangingToPublished) {
          console.log('🔔 [updateVideo] Triggering notification for published video');
          
          const notifReq = {
            body: {
              videoID: parseInt(id),
              videoTitle: videoTitle || currentRecord[0].videoTitle,
              videoCategoryID: videoCategoryID || currentRecord[0].videoCategoryID,
              pubStatusID: 2, // Published
              accID: currentRecord[0].accID
            },
            user: req.user
          };
          
          const notifRes = {
            status: (code) => ({
              json: (data) => {
                console.log(`🔔 [updateVideo] Notification response (${code}):`, data);
              }
            })
          };

          await createVideoNotification(notifReq, notifRes);
          console.log('✅ [updateVideo] Publication notification triggered successfully');
        }
        
        // 🌐 WEBSOCKET EMISSION
        console.log('10. Getting IO instance...');
        const io = getIO();
        console.log('11. IO instance obtained');

        const formattedVideo = formatVideoForClient({
          ...updatedRecord[0],
          videoTitle: videoTitle || currentRecord[0].videoTitle,
          videoURL: videoURL || currentRecord[0].videoURL
        });

        console.log('12. Formatted video for client:', formattedVideo);
        
        if (isChangingToPublished) {
          // Newly published - treat as new video
          console.log(`13. Emitting 'new_video' to users with data:`, formattedVideo);
          io.emit('new_video', formattedVideo);
          
          console.log(`14. Emitting 'admin_video_created' to admin room`);
          io.to('admin-room').emit('admin_video_created', {
            video: formattedVideo,
            adminName: req.user?.name || 'Another Admin',
            adminId: req.user?.id,
            timestamp: new Date()
          });
        } else if (isPublishedUpdate) {
          // Update to existing published video
          console.log(`13. Emitting 'video_updated' to users with data:`, formattedVideo);
          io.emit('video_updated', formattedVideo);
          
          console.log(`14. Emitting 'admin_video_updated' to admin room`);
          io.to('admin-room').emit('admin_video_updated', {
            video: formattedVideo,
            adminName: req.user?.name || 'Another Admin',
            adminId: req.user?.id,
            timestamp: new Date()
          });
        } else if (isUnpublished) {
          // Video was unpublished (changed to Draft or Archived)
          console.log(`13. 🎬 UNPUBLISHING video ID: ${id}`);
          console.log(`14. Emitting 'video_deleted' to users with ID:`, { id: parseInt(id) });
          
          io.emit('video_deleted', { dbId: parseInt(id) });
          
          console.log(`15. Emitting 'admin_video_deleted' to admin room`);
          io.to('admin-room').emit('admin_video_deleted', {
            videoId: parseInt(id),
            videoTitle: videoTitle || currentRecord[0].videoTitle,
            adminName: req.user?.name || 'Another Admin',
            adminId: req.user?.id,
            timestamp: new Date(),
            reason: 'unpublished'
          });
        }
        
        console.log(`✅ [updateVideo] WebSocket ${isChangingToPublished ? 'new' : isPublishedUpdate ? 'update' : 'unpublished'} emitted successfully`);
        
      } catch (notifError) {
        console.error('⚠️ [updateVideo] WebSocket emission failed:', notifError);
        console.error('⚠️ Error stack:', notifError.stack);
      }
    } else {
      console.log('9. ❌ No WebSocket emission needed (no status change affecting users)');
    }

    console.log('16. Sending success response to client');
    res.json({
      success: true,
      message: 'Video updated successfully',
      data: updatedRecord[0]
    });

  } catch (error) {
    console.error('❌ Error updating video:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update video',
      error: error.message
    });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it was published before deletion
    const [currentRecord] = await db.execute(
      `SELECT pubStatusID, videoTitle FROM video_content_tbl 
       WHERE videoID = ? AND isDeleted = 0`,
      [id]
    );

    const wasPublished = currentRecord.length > 0 && currentRecord[0].pubStatusID === 2;
    const videoTitle = currentRecord[0]?.videoTitle || 'Unknown';

    const query = `
      UPDATE video_content_tbl 
      SET isDeleted = 1, lastUpdated = CURRENT_TIMESTAMP
      WHERE videoID = ? AND isDeleted = 0
    `;

    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found or already deleted'
      });
    }

    // 🌐 WEBSOCKET EMISSION if it was published
    if (wasPublished) {
      try {
        const io = getIO();
        
        // Emit to users
        io.emit('video_deleted', { dbId: parseInt(id) });
        
        // Emit to admin room
        io.to('admin-room').emit('admin_video_deleted', {
          videoId: parseInt(id),
          videoTitle: videoTitle,
          adminName: req.user?.name || 'Another Admin',
          adminId: req.user?.id,
          timestamp: new Date(),
          reason: 'deleted'
        });
        
        console.log('✅ [deleteVideo] WebSocket deletion emitted');
      } catch (error) {
        console.error('⚠️ [deleteVideo] WebSocket emission failed:', error);
      }
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: error.message
    });
  }
};

export const getVideoCategories = async (req, res) => {
  try {
    const query = `SELECT videoCategoryID as id, videoCategory as name FROM video_category_tbl`;
    const [results] = await db.execute(query);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching video categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video categories',
      error: error.message
    });
  }
};

export const createVideoCategory = async (req, res) => {
  try {
    const { videoCategory } = req.body;

    if (!videoCategory) {
      return res.status(400).json({
        success: false,
        message: 'Video category name is required'
      });
    }

    const query = `
      INSERT INTO video_category_tbl (videoCategory)
      VALUES (?)
    `;

    const [result] = await db.execute(query, [videoCategory]);

    res.status(201).json({
      success: true,
      message: 'Video category created successfully',
      data: {
        id: result.insertId,
        name: videoCategory
      }
    });

  } catch (error) {
    console.error('Error creating video category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create video category',
      error: error.message
    });
  }
};

// Get published videos for public access
export const getPublishedVideos = async (req, res) => {
  try {
    const query = `
      SELECT 
        v.videoID as id,
        v.videoTitle as title,
        v.videoURL,
        vc.videoCategory as category,
        CONCAT(a.firstName, ' ', a.lastName) as author_name,
        v.createdAt as created_at
      FROM video_content_tbl v
      LEFT JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
      LEFT JOIN account_tbl a ON v.accID = a.accId
      WHERE v.isDeleted = 0 AND v.pubStatusID = 2
      ORDER BY v.createdAt DESC
    `;

    const [results] = await db.execute(query);

    res.json({
      success: true,
      data: results,
      count: results.length
    });

  } catch (error) {
    console.error('Error fetching published videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch published videos',
      error: error.message
    });
  }
};

// Get videos by category
export const getVideosByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const query = `
      SELECT 
        v.videoID as id,
        v.videoTitle as title,
        v.videoURL,
        vc.videoCategory as category,
        CONCAT(a.firstName, ' ', a.lastName) as author_name,
        v.createdAt as created_at
      FROM video_content_tbl v
      LEFT JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
      LEFT JOIN account_tbl a ON v.accID = a.accId
      WHERE v.isDeleted = 0 AND v.pubStatusID = 2 AND v.videoCategoryID = ?
      ORDER BY v.createdAt DESC
    `;

    const [results] = await db.execute(query, [categoryId]);

    res.json({
      success: true,
      data: results,
      count: results.length
    });

  } catch (error) {
    console.error('Error fetching videos by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos by category',
      error: error.message
    });
  }
};