import db from "../../config/db.js";
import path from 'path';
import fs from 'fs';

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

    // Check user authentication - use req.user.id instead of req.user.accId
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
      'SELECT petID FROM pet_tbl WHERE petID = ? AND isDeleted = 0',
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

    // Insert file record - use req.user.id instead of req.user.accId
    await connection.execute(
      `INSERT INTO petmedical_file_tbl 
       (petmedicalID, originalName, storedName, filePath, uploadedOn, uploadedBy, isDeleted) 
       VALUES (?, ?, ?, ?, NOW(), ?, 0)`,
      [petMedicalID, file.originalname, file.filename, file.path, req.user.id] // CHANGED: req.user.id
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Medical record uploaded successfully',
      data: {
        petMedicalID: petMedicalID,
        fileName: file.filename,
        recordTitle,
        uploadedOn: new Date()
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

// Get all medical records with pet and owner info
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

// Get medical records by pet ID
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
        pmf.originalName,  // Added this line
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

// Get medical records by account ID (for clients to see their pets' records)
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

// Get single medical record
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

// Update medical record
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

    // Get current record and file
    const [currentRecord] = await connection.execute(`
      SELECT pm.petMedicalID, pmf.fileID, pmf.filePath 
      FROM petmedical_tbl pm
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
        // Update existing file record
        await connection.execute(
          `UPDATE petmedical_file_tbl 
           SET originalName = ?, storedName = ?, filePath = ?, uploadedOn = NOW() 
           WHERE fileID = ?`,
          [file.originalname, file.filename, file.path, currentFile.fileID]
        );
      } else {
        // Insert new file record
        await connection.execute(
          `INSERT INTO petmedical_file_tbl 
           (petmedicalID, originalName, storedName, filePath, uploadedOn, uploadedBy, isDeleted) 
           VALUES (?, ?, ?, ?, NOW(), ?, 0)`,
          [id, file.originalname, file.filename, file.path, req.user?.accId]
        );
      }
    }

    await connection.commit();

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

// Delete medical record (soft delete)
export const deleteMedicalRecord = async (req, res) => {
  let connection;
  
  try {
    connection = await db.getConnection();
    const { id } = req.params;

    await connection.beginTransaction();

    // Get file path before deletion
    const [record] = await connection.execute(`
      SELECT pmf.filePath 
      FROM petmedical_tbl pm
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

// controllers/admin_controllers/labRecordController.js
export const serveMedicalRecord = async (req, res) => {
  try {
    const { filename } = req.params;
    
    console.log('Serving medical record file:', filename);
    
    // Find the file record - authentication already verified by middleware
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

    // Read file as buffer
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    }

    // Set headers and send file buffer
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileRecord.originalName}"`);
    res.setHeader('Cache-Control', 'no-cache'); // Prevent caching of sensitive files
    
    // Send the file buffer
    res.send(fileBuffer);

  } catch (error) {
    console.error('Serve medical record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get lab types
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