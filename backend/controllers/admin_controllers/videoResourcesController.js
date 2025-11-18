//VIDEOS
import db from "../../config/db.js";

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
              vc.videoCategory as category, ps.pubStatus as status
       FROM video_content_tbl v
       LEFT JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
       LEFT JOIN publication_status_tbl ps ON v.pubStatusID = ps.pubStatsID
       WHERE v.videoID = ?`,
      [result.insertId]
    );

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

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found or already deleted'
      });
    }

    // Fetch updated record
    const [updatedRecord] = await db.execute(
      `SELECT v.videoID as id, v.videoTitle as title, v.videoURL, 
              vc.videoCategory as category, ps.pubStatus as status
       FROM video_content_tbl v
       LEFT JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
       LEFT JOIN publication_status_tbl ps ON v.pubStatusID = ps.pubStatsID
       WHERE v.videoID = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: updatedRecord[0]
    });

  } catch (error) {
    console.error('Error updating video:', error);
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