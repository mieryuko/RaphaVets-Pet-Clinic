import db from '../config/db.js';
// Get all videos
// In the user-only controller at the bottom
export const getAllVideos = async (req, res) => {
  try {
    const query = `
      SELECT 
        v.videoID,
        v.videoTitle,
        v.videoURL,
        vc.videoCategory,
        a.firstName,
        a.lastName,
        v.lastUpdated
      FROM video_content_tbl v
      INNER JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
      INNER JOIN account_tbl a ON v.accID = a.accId
      WHERE v.isDeleted = 0 AND v.pubStatusID = 2
      ORDER BY v.lastUpdated DESC
    `;

    const [results] = await db.execute(query);
    
    const videos = results.map(video => {
      let videoId = '';
      const url = video.videoURL;
      
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      } else {
        videoId = url;
      }
      
      return {
        id: videoId,                    // YouTube ID for display
        dbId: video.videoID,             // Database ID for operations (ADD THIS)
        title: video.videoTitle,
        category: video.videoCategory,
        fullUrl: video.videoURL,
        author: `${video.firstName} ${video.lastName}`,
        lastUpdated: video.lastUpdated
      };
    });

    res.json({
      success: true,
      data: videos,
      count: videos.length
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

// Get videos by category
export const getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const query = `
      SELECT 
        v.videoID,
        v.videoTitle,
        v.videoURL,
        vc.videoCategory,
        a.firstName,
        a.lastName,
        v.lastUpdated
      FROM video_content_tbl v
      INNER JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
      INNER JOIN account_tbl a ON v.accID = a.accId
      WHERE vc.videoCategory = ? AND v.isDeleted = 0 AND v.pubStatusID = 2
      ORDER BY v.lastUpdated DESC
    `;

    const [results] = await db.execute(query, [category]);
    
    const videos = results.map(video => {
      let videoId = '';
      const url = video.videoURL;
      
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      } else {
        videoId = url;
      }
      
      return {
        id: videoId,
        title: video.videoTitle,
        category: video.videoCategory,
        fullUrl: video.videoURL,
        author: `${video.firstName} ${video.lastName}`,
        lastUpdated: video.lastUpdated
      };
    });

    res.json({
      success: true,
      data: videos,
      count: videos.length
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

// Get available video categories
export const getVideoCategories = async (req, res) => {
  try {
    const query = `
      SELECT videoCategory 
      FROM video_category_tbl 
      ORDER BY videoCategory
    `;

    const [results] = await db.execute(query);
    
    const categories = results.map(cat => cat.videoCategory);
    
    res.json({
      success: true,
      data: ['All', ...categories]
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

// Search videos
export const searchVideos = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = `
      SELECT 
        v.videoID,
        v.videoTitle,
        v.videoURL,
        vc.videoCategory,
        a.firstName,
        a.lastName,
        v.lastUpdated
      FROM video_content_tbl v
      INNER JOIN video_category_tbl vc ON v.videoCategoryID = vc.videoCategoryID
      INNER JOIN account_tbl a ON v.accID = a.accId
      WHERE v.isDeleted = 0 AND v.pubStatusID = 2
        AND (v.videoTitle LIKE ? OR vc.videoCategory LIKE ?)
      ORDER BY v.lastUpdated DESC
    `;

    const searchTerm = `%${q}%`;
    const [results] = await db.execute(query, [searchTerm, searchTerm]);
    
    const videos = results.map(video => {
      let videoId = '';
      const url = video.videoURL;
      
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      } else {
        videoId = url;
      }
      
      return {
        id: videoId,
        title: video.videoTitle,
        category: video.videoCategory,
        fullUrl: video.videoURL,
        author: `${video.firstName} ${video.lastName}`,
        lastUpdated: video.lastUpdated
      };
    });

    res.json({
      success: true,
      data: videos,
      count: videos.length
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search videos',
      error: error.message
    });
  }
};