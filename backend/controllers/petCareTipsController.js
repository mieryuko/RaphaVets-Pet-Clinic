import db from '../config/db.js';

// Helper function to map icon keys to FontAwesome classes
const getIconClass = (iconKey) => {
  const iconMap = {
    'Scissors': 'fa-scissors',
    'Dumbbell': 'fa-dumbbell',
    'Droplets': 'fa-droplet',
    'Bone': 'fa-bone',
    'Puzzle': 'fa-puzzle-piece',
    'Heart': 'fa-heart',
    'Stethoscope': 'fa-stethoscope',
    'Utensils': 'fa-utensils',
    'Activity': 'fa-person-running',
    'Bath': 'fa-bath'
  };
  return iconMap[iconKey] || 'fa-paw'; // default icon
};

// Get all pet care tips with categories
export const getAllPetCareTips = async (req, res) => {
  try {
    const query = `
      SELECT 
        pc.petCareID,
        pc.title,
        pc.shortDescription,
        pc.detailedContent,
        pc.learnMoreURL,
        pc.lastUpdated,
        i.iconName,
        i.iconKey,
        pcc.categoryName,
        a.firstName,
        a.lastName
      FROM pet_care_tips_content_tbl pc
      INNER JOIN icon_tbl i ON pc.iconID = i.iconID
      INNER JOIN pet_care_category_tbl pcc ON pc.petCareCategoryID = pcc.petCareCategoryID
      INNER JOIN account_tbl a ON pc.accID = a.accId
      WHERE pc.isDeleted = 0 AND pc.pubStatusID = 2
      ORDER BY pc.lastUpdated DESC
    `;

    const [results] = await db.execute(query);
    
    const tips = results.map(tip => ({
      id: tip.petCareID,
      title: tip.title,
      short: tip.shortDescription,
      long: tip.detailedContent,
      icon: getIconClass(tip.iconKey),
      category: tip.categoryName,
      url: tip.learnMoreURL,
      lastUpdated: tip.lastUpdated,
      author: `${tip.firstName} ${tip.lastName}`
    }));

    res.json({
      success: true,
      data: tips,
      count: tips.length
    });
  } catch (error) {
    console.error('Error fetching pet care tips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pet care tips',
      error: error.message
    });
  }
};

// Get available categories from the database
export const getCategories = async (req, res) => {
  try {
    const query = `
      SELECT categoryName 
      FROM pet_care_category_tbl 
      ORDER BY categoryName
    `;

    const [results] = await db.execute(query);
    
    const categories = results.map(cat => cat.categoryName);
    
    res.json({
      success: true,
      data: ['All', ...categories]
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get pet care tips by category name
export const getPetCareTipsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const query = `
      SELECT 
        pc.petCareID,
        pc.title,
        pc.shortDescription,
        pc.detailedContent,
        pc.learnMoreURL,
        pc.lastUpdated,
        i.iconName,
        i.iconKey,
        pcc.categoryName,
        a.firstName,
        a.lastName
      FROM pet_care_tips_content_tbl pc
      INNER JOIN icon_tbl i ON pc.iconID = i.iconID
      INNER JOIN pet_care_category_tbl pcc ON pc.petCareCategoryID = pcc.petCareCategoryID
      INNER JOIN account_tbl a ON pc.accID = a.accId
      WHERE pc.isDeleted = 0 AND pc.pubStatusID = 2
      AND pcc.categoryName = ?
      ORDER BY pc.lastUpdated DESC
    `;

    const [results] = await db.execute(query, [category]);
    
    const tips = results.map(tip => ({
      id: tip.petCareID,
      title: tip.title,
      short: tip.shortDescription,
      long: tip.detailedContent,
      icon: getIconClass(tip.iconKey),
      category: tip.categoryName,
      url: tip.learnMoreURL,
      lastUpdated: tip.lastUpdated,
      author: `${tip.firstName} ${tip.lastName}`
    }));

    res.json({
      success: true,
      data: tips,
      count: tips.length
    });
  } catch (error) {
    console.error('Error fetching pet care tips by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pet care tips by category',
      error: error.message
    });
  }
};

// Search pet care tips
export const searchPetCareTips = async (req, res) => {
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
        pc.petCareID,
        pc.title,
        pc.shortDescription,
        pc.detailedContent,
        pc.learnMoreURL,
        pc.lastUpdated,
        i.iconName,
        i.iconKey,
        pcc.categoryName,
        a.firstName,
        a.lastName
      FROM pet_care_tips_content_tbl pc
      INNER JOIN icon_tbl i ON pc.iconID = i.iconID
      INNER JOIN pet_care_category_tbl pcc ON pc.petCareCategoryID = pcc.petCareCategoryID
      INNER JOIN account_tbl a ON pc.accID = a.accId
      WHERE pc.isDeleted = 0 AND pc.pubStatusID = 2
      AND (pc.title LIKE ? OR pc.shortDescription LIKE ? OR pcc.categoryName LIKE ?)
      ORDER BY pc.lastUpdated DESC
    `;

    const searchTerm = `%${q}%`;
    const [results] = await db.execute(query, [searchTerm, searchTerm, searchTerm]);
    
    const tips = results.map(tip => ({
      id: tip.petCareID,
      title: tip.title,
      short: tip.shortDescription,
      long: tip.detailedContent,
      icon: getIconClass(tip.iconKey),
      category: tip.categoryName,
      url: tip.learnMoreURL,
      lastUpdated: tip.lastUpdated,
      author: `${tip.firstName} ${tip.lastName}`
    }));

    res.json({
      success: true,
      data: tips,
      count: tips.length
    });
  } catch (error) {
    console.error('Error searching pet care tips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search pet care tips',
      error: error.message
    });
  }
};