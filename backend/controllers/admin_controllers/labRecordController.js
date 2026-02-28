import db from "../../config/db.js";
import path from 'path';
import fs from 'fs';
import { createMedicalRecordNotification } from "../notificationController.js";

export const uploadMedicalRecord = async (req, res) => {
  let connection;
  
  try {
    connection = await db.getConnection();
    const { petID, recordTitle, labTypeID } = req.body;
    const file = req.file;

    // Validation
    if (!petID || !recordTitle || !labTypeID) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: 'PDF file is required' 
      });
    }

    if (!req.user || !req.user.id) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    await connection.beginTransaction();

    // Check if pet exists
    const [petCheck] = await connection.execute(
      'SELECT petID, accID, petName FROM pet_tbl WHERE petID = ? AND isDeleted = 0',
      [petID]
    );

    if (petCheck.length === 0) {
      await connection.rollback();
      fs.unlinkSync(file.path);
      return res.status(404).json({ 
        success: false, 
        message: 'Pet not found' 
      });
    }

    const petOwnerId = petCheck[0].accID;
    const petName = petCheck[0].petName;

    // Check if lab type exists
    const [labTypeCheck] = await connection.execute(
      'SELECT labType_ID FROM labtype_tbl WHERE labType_ID = ?',
      [labTypeID]
    );

    if (labTypeCheck.length === 0) {
      await connection.rollback();
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid lab type' 
      });
    }

    // Insert medical record
    const [medicalResult] = await connection.execute(
      `INSERT INTO petmedical_tbl 
       (petID, recordTitle, labTypeID, uploadedOn, lastUpdated, isDeleted) 
       VALUES (?, ?, ?, NOW(), NOW(), 0)`,
      [petID, recordTitle, labTypeID]
    );

    const petMedicalID = medicalResult.insertId;

    // Insert file record
    await connection.execute(
      `INSERT INTO petmedical_file_tbl 
       (petmedicalID, originalName, storedName, filePath, uploadedOn, uploadedBy, isDeleted) 
       VALUES (?, ?, ?, ?, NOW(), ?, 0)`,
      [petMedicalID, file.originalname, file.filename, file.path, req.user.id]
    );

    await connection.commit();

    // ===========================================
    // 🔔 EMIT SOCKET EVENT for real-time updates
    // ===========================================
    try {
      const io = req.app.get('io');
      
      if (io) {
        // Fetch the complete record data to send
        const [newRecord] = await connection.execute(`
          SELECT 
            pm.petMedicalID as id,
            pm.recordTitle as title,
            DATE_FORMAT(pm.uploadedOn, '%M %e, %Y') as date,
            lt.labType as type,
            pmf.fileID,
            pmf.originalName,
            pmf.storedName,
            pmf.filePath,
            p.petName,
            p.petID,
            pm.labTypeID,
            CASE 
              WHEN pm.labTypeID = 1 THEN 'lab'
              WHEN pm.labTypeID = 2 THEN 'medical'
            END as recordCategory
          FROM petmedical_tbl pm
          INNER JOIN pet_tbl p ON pm.petID = p.petID
          INNER JOIN labtype_tbl lt ON pm.labTypeID = lt.labType_ID
          LEFT JOIN petmedical_file_tbl pmf ON pm.petMedicalID = pmf.petmedicalID AND pmf.isDeleted = 0
          WHERE pm.petMedicalID = ?
        `, [petMedicalID]);

        if (newRecord.length > 0) {
          const recordData = newRecord[0];
          
          // Emit to the specific user room
          io.to(`user_${petOwnerId}`).emit('new_medical_record', recordData);
          
          console.log(`📡 Socket event emitted to user_${petOwnerId}:`, recordData);
        }
      }
    } catch (socketError) {
      console.error('Failed to emit socket event:', socketError);
    }

    // ===========================================
    // 🔔 TRIGGER NOTIFICATION for new medical record
    // ===========================================
    try {
      console.log('🔔 [uploadMedicalRecord] Triggering notification for pet owner:', petOwnerId);
      
      const notifReq = {
        body: {
          petMedicalID: petMedicalID,
          petID: petID,
          recordTitle: recordTitle,
          labTypeID: labTypeID
        },
        user: req.user
      };
      
      const notifRes = {
        status: (code) => ({
          json: (data) => {
            console.log(`🔔 [uploadMedicalRecord] Notification response (${code}):`, data);
          }
        })
      };

      await createMedicalRecordNotification(notifReq, notifRes);
      console.log('✅ [uploadMedicalRecord] Notification triggered successfully for pet owner:', petOwnerId);
      
    } catch (notifError) {
      console.error('⚠️ [uploadMedicalRecord] Failed to send notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Medical record uploaded successfully',
      data: {
        petMedicalID: petMedicalID,
        fileName: file.filename,
        recordTitle,
        uploadedOn: new Date(),
        notificationSent: true
      }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload medical record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const getMedicalRecords = async (req, res) => {
  try {
    const [records] = await db.execute(`
      SELECT 
        pm.petMedicalID as id,
        pt.petName,
        pt.petID,
        CONCAT(act.firstName, ' ', act.lastName) as owner,
        lt.labType as type,
        pm.recordTitle,
        pmf.originalName,
        pmf.storedName as fileName,
        pmf.filePath,
        DATE_FORMAT(pm.uploadedOn, '%Y-%m-%d %H:%i:%s') as uploadedOn
      FROM petmedical_tbl pm
      INNER JOIN pet_tbl pt ON pm.petID = pt.petID
      INNER JOIN account_tbl act ON pt.accID = act.accId
      INNER JOIN labtype_tbl lt ON pm.labTypeID = lt.labType_ID
      LEFT JOIN petmedical_file_tbl pmf ON pm.petMedicalID = pmf.petmedicalID AND pmf.isDeleted = 0
      WHERE pm.isDeleted = 0
      ORDER BY pm.uploadedOn DESC
    `);

    res.json({
      success: true,
      data: records
    });

  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const getMedicalRecordsByPet = async (req, res) => {
  try {
    const { petId } = req.params;

    const [records] = await db.execute(`
      SELECT 
        pm.petMedicalID as id,
        pt.petName,
        CONCAT(act.firstName, ' ', act.lastName) as owner,
        lt.labType as type,
        pm.recordTitle,
        pmf.originalName,
        pmf.storedName as fileName,
        pmf.filePath,
        DATE_FORMAT(pm.uploadedOn, '%Y-%m-%d %H:%i:%s') as uploadedOn
      FROM petmedical_tbl pm
      INNER JOIN pet_tbl pt ON pm.petID = pt.petID
      INNER JOIN account_tbl act ON pt.accID = act.accId
      INNER JOIN labtype_tbl lt ON pm.labTypeID = lt.labType_ID
      LEFT JOIN petmedical_file_tbl pmf ON pm.petMedicalID = pmf.petmedicalID AND pmf.isDeleted = 0
      WHERE pm.petID = ? AND pm.isDeleted = 0
      ORDER BY pm.uploadedOn DESC
    `, [petId]);

    res.json({
      success: true,
      data: records
    });

  } catch (error) {
    console.error('Get medical records by pet error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const getMedicalRecordsByAccount = async (req, res) => {
  try {
    const { accId } = req.params;

    const [records] = await db.execute(`
      SELECT 
        pm.petMedicalID as id,
        pt.petName,
        pt.petID,
        CONCAT(act.firstName, ' ', act.lastName) as owner,
        lt.labType as type,
        pm.recordTitle,
        pmf.storedName as fileName,
        pmf.filePath,
        pmf.originalName,
        DATE_FORMAT(pm.uploadedOn, '%Y-%m-%d %H:%i:%s') as uploadedOn
      FROM petmedical_tbl pm
      INNER JOIN pet_tbl pt ON pm.petID = pt.petID
      INNER JOIN account_tbl act ON pt.accID = act.accId
      INNER JOIN labtype_tbl lt ON pm.labTypeID = lt.labType_ID
      LEFT JOIN petmedical_file_tbl pmf ON pm.petMedicalID = pmf.petmedicalID AND pmf.isDeleted = 0
      WHERE pt.accID = ? AND pm.isDeleted = 0
      ORDER BY pm.uploadedOn DESC
    `, [accId]);

    res.json({
      success: true,
      data: records
    });

  } catch (error) {
    console.error('Get medical records by account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const [records] = await db.execute(`
      SELECT 
        pm.petMedicalID as id,
        pt.petName,
        pt.petID,
        pt.accID,
        CONCAT(act.firstName, ' ', act.lastName) as owner,
        lt.labType as type,
        lt.labType_ID as labTypeID,
        pm.recordTitle,
        pmf.fileID,
        pmf.originalName,
        pmf.storedName as fileName,
        pmf.filePath,
        DATE_FORMAT(pm.uploadedOn, '%Y-%m-%d %H:%i:%s') as uploadedOn,
        DATE_FORMAT(pm.lastUpdated, '%Y-%m-%d %H:%i:%s') as lastUpdated
      FROM petmedical_tbl pm
      INNER JOIN pet_tbl pt ON pm.petID = pt.petID
      INNER JOIN account_tbl act ON pt.accID = act.accId
      INNER JOIN labtype_tbl lt ON pm.labTypeID = lt.labType_ID
      LEFT JOIN petmedical_file_tbl pmf ON pm.petMedicalID = pmf.petmedicalID AND pmf.isDeleted = 0
      WHERE pm.petMedicalID = ? AND pm.isDeleted = 0
    `, [id]);

    if (records.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medical record not found' 
      });
    }

    res.json({
      success: true,
      data: records[0]
    });

  } catch (error) {
    console.error('Get medical record by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const updateMedicalRecord = async (req, res) => {
  let connection;
  
  try {
    connection = await db.getConnection();
    const { id } = req.params;
    const { recordTitle, labTypeID } = req.body;
    const file = req.file;

    if (!recordTitle || !labTypeID) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Record title and type are required' 
      });
    }

    await connection.beginTransaction();

    // Get current record and file with pet owner info
    const [currentRecord] = await connection.execute(`
      SELECT pm.petMedicalID, pmf.fileID, pmf.filePath, p.accID as petOwnerId
      FROM petmedical_tbl pm
      INNER JOIN pet_tbl p ON pm.petID = p.petID
      LEFT JOIN petmedical_file_tbl pmf ON pm.petMedicalID = pmf.petmedicalID AND pmf.isDeleted = 0
      WHERE pm.petMedicalID = ? AND pm.isDeleted = 0
    `, [id]);

    if (currentRecord.length === 0) {
      await connection.rollback();
      if (file) fs.unlinkSync(file.path);
      return res.status(404).json({ 
        success: false, 
        message: 'Medical record not found' 
      });
    }

    const petOwnerId = currentRecord[0].petOwnerId;

    // Check if lab type exists
    const [labTypeCheck] = await connection.execute(
      'SELECT labType_ID FROM labtype_tbl WHERE labType_ID = ?',
      [labTypeID]
    );

    if (labTypeCheck.length === 0) {
      await connection.rollback();
      if (file) fs.unlinkSync(file.path);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid lab type' 
      });
    }

    // Update medical record
    await connection.execute(
      `UPDATE petmedical_tbl 
       SET recordTitle = ?, labTypeID = ?, lastUpdated = NOW() 
       WHERE petMedicalID = ?`,
      [recordTitle, labTypeID, id]
    );

    // If new file uploaded, update file record
    if (file) {
      const currentFile = currentRecord[0];
      
      // Delete old file from filesystem
      if (currentFile.filePath && fs.existsSync(currentFile.filePath)) {
        fs.unlinkSync(currentFile.filePath);
      }

      // Update or insert file record
      if (currentFile.fileID) {
        await connection.execute(
          `UPDATE petmedical_file_tbl 
           SET originalName = ?, storedName = ?, filePath = ?, uploadedOn = NOW() 
           WHERE fileID = ?`,
          [file.originalname, file.filename, file.path, currentFile.fileID]
        );
      } else {
        await connection.execute(
          `INSERT INTO petmedical_file_tbl 
           (petmedicalID, originalName, storedName, filePath, uploadedOn, uploadedBy, isDeleted) 
           VALUES (?, ?, ?, ?, NOW(), ?, 0)`,
          [id, file.originalname, file.filename, file.path, req.user?.id]
        );
      }
    }

    await connection.commit();

    // ===========================================
    // 🔔 EMIT SOCKET EVENT for updates
    // ===========================================
    try {
      const io = req.app.get('io');
      
      if (io) {
        // Fetch the updated record data
        const [updatedRecord] = await connection.execute(`
          SELECT 
            pm.petMedicalID as id,
            pm.recordTitle as title,
            DATE_FORMAT(pm.uploadedOn, '%M %e, %Y') as date,
            lt.labType as type,
            pmf.fileID,
            pmf.originalName,
            pmf.storedName,
            pmf.filePath,
            p.petName,
            p.petID,
            pm.labTypeID,
            CASE 
              WHEN pm.labTypeID = 1 THEN 'lab'
              WHEN pm.labTypeID = 2 THEN 'medical'
            END as recordCategory
          FROM petmedical_tbl pm
          INNER JOIN pet_tbl p ON pm.petID = p.petID
          INNER JOIN labtype_tbl lt ON pm.labTypeID = lt.labType_ID
          LEFT JOIN petmedical_file_tbl pmf ON pm.petMedicalID = pmf.petmedicalID AND pmf.isDeleted = 0
          WHERE pm.petMedicalID = ?
        `, [id]);

        if (updatedRecord.length > 0) {
          io.to(`user_${petOwnerId}`).emit('medical_record_updated', updatedRecord[0]);
          console.log(`📡 Socket update event emitted to user_${petOwnerId}`);
        }
      }
    } catch (socketError) {
      console.error('Failed to emit socket event:', socketError);
    }

    res.json({
      success: true,
      message: 'Medical record updated successfully',
      data: {
        petMedicalID: parseInt(id),
        recordTitle,
        labTypeID: parseInt(labTypeID)
      }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update medical record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const deleteMedicalRecord = async (req, res) => {
  let connection;
  
  try {
    connection = await db.getConnection();
    const { id } = req.params;

    await connection.beginTransaction();

    // Get file path and pet owner info before deletion
    const [record] = await connection.execute(`
      SELECT pmf.filePath, p.accID as petOwnerId
      FROM petmedical_tbl pm
      INNER JOIN pet_tbl p ON pm.petID = p.petID
      LEFT JOIN petmedical_file_tbl pmf ON pm.petMedicalID = pmf.petmedicalID AND pmf.isDeleted = 0
      WHERE pm.petMedicalID = ? AND pm.isDeleted = 0
    `, [id]);

    if (record.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        message: 'Medical record not found' 
      });
    }

    const petOwnerId = record[0].petOwnerId;

    // Soft delete the medical record
    await connection.execute(
      'UPDATE petmedical_tbl SET isDeleted = 1 WHERE petMedicalID = ?',
      [id]
    );

    // Soft delete associated files
    await connection.execute(
      'UPDATE petmedical_file_tbl SET isDeleted = 1 WHERE petmedicalID = ?',
      [id]
    );

    await connection.commit();

    // ===========================================
    // 🔔 EMIT SOCKET EVENT for deletion
    // ===========================================
    try {
      const io = req.app.get('io');
      
      if (io) {
        io.to(`user_${petOwnerId}`).emit('medical_record_deleted', { id: parseInt(id) });
        console.log(`📡 Socket delete event emitted to user_${petOwnerId} for record ${id}`);
      }
    } catch (socketError) {
      console.error('Failed to emit socket event:', socketError);
    }

    res.json({
      success: true,
      message: 'Medical record deleted successfully'
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Delete medical record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const serveMedicalRecord = async (req, res) => {
  try {
    const { filename } = req.params;
    
    console.log('Serving medical record file:', filename);
    
    const [fileRecords] = await db.execute(
      'SELECT filePath, originalName FROM petmedical_file_tbl WHERE storedName = ? AND isDeleted = 0',
      [filename]
    );

    if (fileRecords.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }

    const fileRecord = fileRecords[0];
    const filePath = fileRecord.filePath;

    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      return res.status(404).json({ 
        success: false, 
        message: 'File not found on server' 
      });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileRecord.originalName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(fileBuffer);

  } catch (error) {
    console.error('Serve medical record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const getLabTypes = async (req, res) => {
  try {
    const [labTypes] = await db.execute(`
      SELECT labType_ID as id, labType as name 
      FROM labtype_tbl 
      ORDER BY labType
    `);

    res.json({
      success: true,
      data: labTypes
    });

  } catch (error) {
    console.error('Get lab types error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};