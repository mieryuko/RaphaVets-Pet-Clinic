import db from "../../config/db.js";
import { createPetTipsNotification } from "../notificationController.js";
import { getIO } from "../../socket.js"; 

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
  return iconMap[iconKey] || 'fa-paw';
};

const formatTipForClient = (tip) => ({
  id: tip.petCareID || tip.id,
  title: tip.title,
  short: tip.shortDescription || tip.short,
  long: tip.detailedContent || tip.long,
  icon: getIconClass(tip.iconKey),
  category: tip.categoryName || tip.category,
  url: tip.learnMoreURL || tip.url,
  lastUpdated: tip.lastUpdated,
  author: tip.author || `${tip.firstName || ''} ${tip.lastName || ''}`.trim()
});

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
        i.iconKey,
        CONCAT(a.firstName, ' ', a.lastName) as author,
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
        i.iconKey,
        i.iconID,
        pc.petCareCategoryID,
        pt.pubStatusID,
        CONCAT(a.firstName, ' ', a.lastName) as author,
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
      pubStatusID = 1
    } = req.body;

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
      accID,
      parseInt(iconID),
      title,
      parseInt(petCareCategoryID),
      shortDescription,
      learnMoreURL || '',
      detailedContent,
      parseInt(pubStatusID)
    ]);

    // Fetch complete record with all data for client formatting
    const [newRecord] = await db.execute(
      `SELECT 
        pt.petCareID,
        pt.title,
        pt.shortDescription,
        pt.detailedContent,
        pt.learnMoreURL,
        pt.lastUpdated,
        i.iconKey,
        pcc.categoryName,
        a.firstName,
        a.lastName
       FROM pet_care_tips_content_tbl pt
       LEFT JOIN pet_care_category_tbl pcc ON pt.petCareCategoryID = pcc.petCareCategoryID
       LEFT JOIN icon_tbl i ON pt.iconID = i.iconID
       LEFT JOIN account_tbl a ON pt.accID = a.accId
       WHERE pt.petCareID = ?`,
      [result.insertId]
    );

    // ===========================================
    // 🔔 TRIGGER NOTIFICATION AND WEBSOCKET if published
    // ===========================================
    if (parseInt(pubStatusID) === 2) {
      try {
        console.log('🔔 [createPetCareTip] Triggering notification and WebSocket update');
        
        // Send notification
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
              console.log(`🔔 Notification response (${code}):`, data);
            }
          })
        };

        await createPetTipsNotification(notifReq, notifRes);
        
        // 🌐 WEBSOCKET EMISSION
        try {
          const io = getIO();
          
          const formattedTip = formatTipForClient({
            ...newRecord[0],
            id: result.insertId
          });
          
          // Emit to all connected users
          io.emit('new_pet_care_tip', formattedTip);
          
          // Emit to admin room for other admins
          io.to('admin-room').emit('admin_tip_created', {
            tip: formattedTip,
            adminName: req.user?.name || 'Another Admin',
            adminId: accID,
            timestamp: new Date()
          });
          
          console.log('✅ [createPetCareTip] WebSocket events emitted');
        } catch (wsError) {
          console.error('⚠️ [createPetCareTip] WebSocket emission failed:', wsError.message);
        }
        
      } catch (notifError) {
        console.error('⚠️ [createPetCareTip] Failed to send notification:', notifError);
      }
    }

    // Format for admin response
    const adminFormattedRecord = {
      id: newRecord[0]?.petCareID,
      title: newRecord[0]?.title,
      shortDescription: newRecord[0]?.shortDescription,
      detailedContent: newRecord[0]?.detailedContent,
      learnMoreURL: newRecord[0]?.learnMoreURL,
      category: newRecord[0]?.categoryName,
      icon: newRecord[0]?.iconKey,
      author: `${newRecord[0]?.firstName || ''} ${newRecord[0]?.lastName || ''}`.trim(),
      lastUpdated: newRecord[0]?.lastUpdated
    };

    res.status(201).json({
      success: true,
      message: 'Pet care tip created successfully',
      data: adminFormattedRecord
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

    // Get current record with all data needed for client formatting
    const [currentRecord] = await db.execute(
      `SELECT 
        pt.pubStatusID, 
        pt.title, 
        pt.shortDescription, 
        pt.detailedContent,
        pt.learnMoreURL,
        pt.accID,
        i.iconKey,
        pcc.categoryName,
        a.firstName,
        a.lastName
       FROM pet_care_tips_content_tbl pt
       LEFT JOIN pet_care_category_tbl pcc ON pt.petCareCategoryID = pcc.petCareCategoryID
       LEFT JOIN icon_tbl i ON pt.iconID = i.iconID
       LEFT JOIN account_tbl a ON pt.accID = a.accId
       WHERE pt.petCareID = ? AND pt.isDeleted = 0`,
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
    const isPublishedUpdate = wasPublished && willBePublished;
    const isUnpublished = wasPublished && pubStatusID !== undefined && parseInt(pubStatusID) !== 2; // NEW

    // Build dynamic query
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

    // Fetch updated record with all data for client formatting
    const [updatedRecord] = await db.execute(
      `SELECT 
        pt.petCareID,
        pt.title,
        pt.shortDescription,
        pt.detailedContent,
        pt.learnMoreURL,
        pt.lastUpdated,
        i.iconKey,
        pcc.categoryName,
        a.firstName,
        a.lastName
       FROM pet_care_tips_content_tbl pt
       LEFT JOIN pet_care_category_tbl pcc ON pt.petCareCategoryID = pcc.petCareCategoryID
       LEFT JOIN icon_tbl i ON pt.iconID = i.iconID
       LEFT JOIN account_tbl a ON pt.accID = a.accId
       WHERE pt.petCareID = ?`,
      [id]
    );

    // ===========================================
    // 🔔 TRIGGER NOTIFICATION AND WEBSOCKET for all status changes
    // ===========================================
    if (isChangingToPublished || isPublishedUpdate || isUnpublished) {
      try {
        // Send notification only when first published
        if (isChangingToPublished) {
          console.log('🔔 [updatePetCareTip] Triggering notification for newly published tip');
          
          const notifReq = {
            body: {
              petCareID: parseInt(id),
              title: title || currentRecord[0].title,
              shortDescription: shortDescription || currentRecord[0].shortDescription,
              pubStatusID: 2,
              accID: currentRecord[0].accID
            },
            user: req.user
          };
          
          const notifRes = {
            status: (code) => ({
              json: (data) => {
                console.log(`🔔 Notification response (${code}):`, data);
              }
            })
          };

          await createPetTipsNotification(notifReq, notifRes);
        }
        
        // 🌐 WEBSOCKET EMISSION
        try {
          const io = getIO();
          
          const formattedTip = formatTipForClient({
            ...updatedRecord[0],
            id: parseInt(id)
          });
          
          if (isChangingToPublished) {
            // Newly published - treat as new tip
            io.emit('new_pet_care_tip', formattedTip);
            io.to('admin-room').emit('admin_tip_created', {
              tip: formattedTip,
              adminName: req.user?.name || 'Another Admin',
              adminId: req.user?.id,
              timestamp: new Date()
            });
          } else if (isPublishedUpdate) {
            // Update to existing published tip
            io.emit('pet_care_tip_updated', formattedTip);
            io.to('admin-room').emit('admin_tip_updated', {
              tip: formattedTip,
              adminName: req.user?.name || 'Another Admin',
              adminId: req.user?.id,
              timestamp: new Date()
            });
          } else if (isUnpublished) {
            // Tip was unpublished (changed to Draft or Archived)
            io.emit('pet_care_tip_deleted', { id: parseInt(id) });
            io.to('admin-room').emit('admin_tip_deleted', {
              tipId: parseInt(id),
              tipTitle: title || currentRecord[0].title,
              adminName: req.user?.name || 'Another Admin',
              adminId: req.user?.id,
              timestamp: new Date(),
              reason: 'unpublished'
            });
          }
          
          console.log(`✅ [updatePetCareTip] WebSocket ${isChangingToPublished ? 'new' : isPublishedUpdate ? 'update' : 'unpublished'} emitted`);
        } catch (wsError) {
          console.error('⚠️ [updatePetCareTip] WebSocket emission failed:', wsError.message);
        }
        
      } catch (notifError) {
        console.error('⚠️ [updatePetCareTip] Failed to send notification:', notifError);
      }
    }

    // Format for admin response
    const adminFormattedRecord = {
      id: updatedRecord[0]?.petCareID,
      title: updatedRecord[0]?.title,
      shortDescription: updatedRecord[0]?.shortDescription,
      detailedContent: updatedRecord[0]?.detailedContent,
      learnMoreURL: updatedRecord[0]?.learnMoreURL,
      category: updatedRecord[0]?.categoryName,
      icon: updatedRecord[0]?.iconKey,
      author: `${updatedRecord[0]?.firstName || ''} ${updatedRecord[0]?.lastName || ''}`.trim(),
      lastUpdated: updatedRecord[0]?.lastUpdated
    };

    res.json({
      success: true,
      message: 'Pet care tip updated successfully',
      data: adminFormattedRecord
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

    // Check if it was published before deletion
    const [currentRecord] = await db.execute(
      `SELECT pubStatusID, title FROM pet_care_tips_content_tbl 
       WHERE petCareID = ? AND isDeleted = 0`,
      [id]
    );

    const wasPublished = currentRecord.length > 0 && currentRecord[0].pubStatusID === 2;
    const tipTitle = currentRecord[0]?.title || 'Unknown';

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

    // Emit WebSocket for deletion if it was published
    if (wasPublished) {
      try {
        const io = getIO();
        io.emit('pet_care_tip_deleted', { id: parseInt(id) });
        io.to('admin-room').emit('admin_tip_deleted', {
          tipId: parseInt(id),
          tipTitle: tipTitle,
          adminName: req.user?.name || 'Another Admin',
          adminId: req.user?.id,
          timestamp: new Date(),
          reason: 'deleted'
        });
        console.log('✅ [deletePetCareTip] WebSocket deletion emitted');
      } catch (wsError) {
        console.error('⚠️ [deletePetCareTip] WebSocket emission failed:', wsError.message);
      }
    }

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