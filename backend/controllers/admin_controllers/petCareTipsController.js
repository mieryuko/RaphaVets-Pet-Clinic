import db from "../../config/db.js";
import { createPetTipsNotification } from "../notificationController.js"; // Import notification function

//PET CARE TIPS

export const getAllPetCareTips = async (req, res) => {
  try {
    const query = `
      SELECT 
        pt.petCareID as id,
        pt.title,
        pt.shortDescription,
        pt.detailedContent,
        pt.learnMoreURL,
        pc.categoryName as category,
        i.iconName as icon,
        CONCAT(a.firstName, ' ', a.lastName) as author_name,
        pt.createdAt as created_at,
        pt.lastUpdated as updated_at,
        ps.pubStatus as status
      FROM pet_care_tips_content_tbl pt
      LEFT JOIN pet_care_category_tbl pc ON pt.petCareCategoryID = pc.petCareCategoryID
      LEFT JOIN icon_tbl i ON pt.iconID = i.iconID
      LEFT JOIN account_tbl a ON pt.accID = a.accId
      LEFT JOIN publication_status_tbl ps ON pt.pubStatusID = ps.pubStatsID
      WHERE pt.isDeleted = 0
      ORDER BY pt.lastUpdated DESC
    `;

    const [results] = await db.execute(query);

    res.json({
      success: true,
      data: results,
      count: results.length
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

export const getPetCareTipById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        pt.petCareID as id,
        pt.title,
        pt.shortDescription,
        pt.detailedContent,
        pt.learnMoreURL,
        pc.categoryName as category,
        i.iconName as icon,
        i.iconID,
        pc.petCareCategoryID,
        pt.pubStatusID,
        CONCAT(a.firstName, ' ', a.lastName) as author_name,
        pt.accID,
        pt.createdAt as created_at,
        pt.lastUpdated as updated_at,
        ps.pubStatus as status
      FROM pet_care_tips_content_tbl pt
      LEFT JOIN pet_care_category_tbl pc ON pt.petCareCategoryID = pc.petCareCategoryID
      LEFT JOIN icon_tbl i ON pt.iconID = i.iconID
      LEFT JOIN account_tbl a ON pt.accID = a.accId
      LEFT JOIN publication_status_tbl ps ON pt.pubStatusID = ps.pubStatsID
      WHERE pt.petCareID = ? AND pt.isDeleted = 0
    `;

    const [results] = await db.execute(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pet care tip not found'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });

  } catch (error) {
    console.error('Error fetching pet care tip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pet care tip',
      error: error.message
    });
  }
};

export const createPetCareTip = async (req, res) => {
  try {
    // Get accID from authenticated user (not from req.body)
    const accID = req.user?.accId || req.user?.id;

    if (!accID) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const {
      title,
      shortDescription,
      detailedContent,
      learnMoreURL,
      iconID,
      petCareCategoryID,
      pubStatusID = 1 // Default to Draft if not provided
    } = req.body;

    // Validate required fields (REMOVE accID from validation)
    if (!title || !shortDescription || !detailedContent || !iconID || !petCareCategoryID) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, shortDescription, detailedContent, iconID, petCareCategoryID'
      });
    }

    const query = `
      INSERT INTO pet_care_tips_content_tbl 
        (accID, iconID, title, petCareCategoryID, shortDescription, learnMoreURL, detailedContent, pubStatusID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      accID, // From req.user, not req.body
      parseInt(iconID),
      title,
      parseInt(petCareCategoryID),
      shortDescription,
      learnMoreURL || '',
      detailedContent,
      parseInt(pubStatusID)
    ]);

    // Fetch the created record to return complete data
    const [newRecord] = await db.execute(
      `SELECT pt.petCareID as id, pt.title, pt.shortDescription, pt.detailedContent, pt.learnMoreURL, 
              pc.categoryName as category, i.iconName as icon, ps.pubStatus as status, pt.pubStatusID
       FROM pet_care_tips_content_tbl pt
       LEFT JOIN pet_care_category_tbl pc ON pt.petCareCategoryID = pc.petCareCategoryID
       LEFT JOIN icon_tbl i ON pt.iconID = i.iconID
       LEFT JOIN publication_status_tbl ps ON pt.pubStatusID = ps.pubStatsID
       WHERE pt.petCareID = ?`,
      [result.insertId]
    );

    // ===========================================
    // 🔔 TRIGGER NOTIFICATION if published immediately
    // ===========================================
    if (parseInt(pubStatusID) === 2) { // 2 = Published
      try {
        console.log('🔔 [createPetCareTip] Triggering notification for new pet care tip');
        
        const notifReq = {
          body: {
            petCareID: result.insertId,
            title: title,
            shortDescription: shortDescription,
            pubStatusID: parseInt(pubStatusID),
            accID: accID
          },
          user: req.user
        };
        
        const notifRes = {
          status: (code) => ({
            json: (data) => {
              console.log(`🔔 [createPetCareTip] Notification response (${code}):`, data);
            }
          })
        };

        await createPetTipsNotification(notifReq, notifRes);
        console.log('✅ [createPetCareTip] Notification triggered successfully');
        
      } catch (notifError) {
        console.error('⚠️ [createPetCareTip] Failed to send notification:', notifError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Pet care tip created successfully',
      data: newRecord[0]
    });

  } catch (error) {
    console.error('Error creating pet care tip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pet care tip',
      error: error.message
    });
  }
};

export const updatePetCareTip = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      shortDescription,
      detailedContent,
      learnMoreURL,
      iconID,
      petCareCategoryID,
      pubStatusID
    } = req.body;

    // First, get the current record to check if status is changing to Published
    const [currentRecord] = await db.execute(
      `SELECT pubStatusID, title, shortDescription, accID 
       FROM pet_care_tips_content_tbl 
       WHERE petCareID = ? AND isDeleted = 0`,
      [id]
    );

    if (currentRecord.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pet care tip not found'
      });
    }

    const wasPublished = currentRecord[0].pubStatusID === 2;
    const willBePublished = pubStatusID !== undefined ? parseInt(pubStatusID) === 2 : wasPublished;
    const isChangingToPublished = !wasPublished && willBePublished;

    // Build dynamic query based on provided fields
    let query = `UPDATE pet_care_tips_content_tbl SET `;
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (shortDescription !== undefined) {
      updates.push('shortDescription = ?');
      params.push(shortDescription);
    }
    if (detailedContent !== undefined) {
      updates.push('detailedContent = ?');
      params.push(detailedContent);
    }
    if (learnMoreURL !== undefined) {
      updates.push('learnMoreURL = ?');
      params.push(learnMoreURL || '');
    }
    if (iconID !== undefined) {
      updates.push('iconID = ?');
      params.push(parseInt(iconID));
    }
    if (petCareCategoryID !== undefined) {
      updates.push('petCareCategoryID = ?');
      params.push(parseInt(petCareCategoryID));
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
    query += updates.join(', ') + ' WHERE petCareID = ? AND isDeleted = 0';
    params.push(parseInt(id));

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pet care tip not found or already deleted'
      });
    }

    // Fetch updated record
    const [updatedRecord] = await db.execute(
      `SELECT pt.petCareID as id, pt.title, pt.shortDescription, pt.detailedContent, pt.learnMoreURL, 
              pc.categoryName as category, i.iconName as icon, ps.pubStatus as status, pt.pubStatusID
       FROM pet_care_tips_content_tbl pt
       LEFT JOIN pet_care_category_tbl pc ON pt.petCareCategoryID = pc.petCareCategoryID
       LEFT JOIN icon_tbl i ON pt.iconID = i.iconID
       LEFT JOIN publication_status_tbl ps ON pt.pubStatusID = ps.pubStatsID
       WHERE pt.petCareID = ?`,
      [id]
    );

    // ===========================================
    // 🔔 TRIGGER NOTIFICATION if status changed to Published
    // ===========================================
    if (isChangingToPublished) {
      try {
        console.log('🔔 [updatePetCareTip] Triggering notification for published pet care tip');
        
        const notifReq = {
          body: {
            petCareID: parseInt(id),
            title: title || currentRecord[0].title,
            shortDescription: shortDescription || currentRecord[0].shortDescription,
            pubStatusID: 2, // Published
            accID: currentRecord[0].accID
          },
          user: req.user
        };
        
        const notifRes = {
          status: (code) => ({
            json: (data) => {
              console.log(`🔔 [updatePetCareTip] Notification response (${code}):`, data);
            }
          })
        };

        await createPetTipsNotification(notifReq, notifRes);
        console.log('✅ [updatePetCareTip] Publication notification triggered successfully');
        
      } catch (notifError) {
        console.error('⚠️ [updatePetCareTip] Failed to send publication notification:', notifError);
      }
    }

    res.json({
      success: true,
      message: 'Pet care tip updated successfully',
      data: updatedRecord[0]
    });

  } catch (error) {
    console.error('Error updating pet care tip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pet care tip',
      error: error.message
    });
  }
};

export const deletePetCareTip = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it was published before deletion (optional notification)
    const [currentRecord] = await db.execute(
      `SELECT pubStatusID, title, shortDescription, accID 
       FROM pet_care_tips_content_tbl 
       WHERE petCareID = ? AND isDeleted = 0`,
      [id]
    );

    const wasPublished = currentRecord.length > 0 && currentRecord[0].pubStatusID === 2;

    const query = `
      UPDATE pet_care_tips_content_tbl 
      SET isDeleted = 1, lastUpdated = CURRENT_TIMESTAMP
      WHERE petCareID = ? AND isDeleted = 0
    `;

    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pet care tip not found or already deleted'
      });
    }

    // Optional: Send notification for deletion? 
    // Usually you don't notify for deletions, but you can if needed

    res.json({
      success: true,
      message: 'Pet care tip deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting pet care tip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pet care tip',
      error: error.message
    });
  }
};

export const createPetCareCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const query = `
      INSERT INTO pet_care_category_tbl (categoryName)
      VALUES (?)
    `;

    const [result] = await db.execute(query, [categoryName]);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: result.insertId,
        name: categoryName
      }
    });

  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Additional utility functions
export const getPetCareCategories = async (req, res) => {
  try {
    const query = `SELECT petCareCategoryID as id, categoryName as name FROM pet_care_category_tbl`;
    const [results] = await db.execute(query);
    
    res.json({
      success: true,
      data: results
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

export const getIcons = async (req, res) => {
  try {
    const query = `SELECT iconID as id, iconName as name, icon, iconKey FROM icon_tbl`;
    const [results] = await db.execute(query);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching icons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch icons',
      error: error.message
    });
  }
};

export const getPublicationStatuses = async (req, res) => {
  try {
    const query = `SELECT pubStatsID as id, pubStatus as name, description FROM publication_status_tbl`;
    const [results] = await db.execute(query);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching publication statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch publication statuses',
      error: error.message
    });
  }
};