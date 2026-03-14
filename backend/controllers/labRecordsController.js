import db from '../config/db.js';
import axios from 'axios';
import { buildOptimizedPdfUrlFromStoredName, buildPrivatePdfUrlFromStoredName } from '../utils/cloudinary.js';

const isStaffRole = (role) => {
  const numericRole = Number(role);
  return numericRole === 2 || numericRole === 3;
};

// Get all medical records for a user (across all their pets)
export const getMedicalRecordsByUser = async (req, res) => {
  try {
    const { accID } = req.params;
    const { recordType } = req.query;
    const requesterId = Number(req.user?.id);
    const requesterRole = Number(req.user?.role || 0);

    if (!isStaffRole(requesterRole) && Number(accID) !== requesterId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only access your own records.'
      });
    }
    
    let typeCondition = '';
    if (recordType === 'lab') {
      typeCondition = 'AND pm.labTypeID = 1'; // Lab Record
    } else if (recordType === 'medical') {
      typeCondition = 'AND pm.labTypeID = 2'; // Medical History
    }
    
    const query = `
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
      WHERE p.accID = ? AND pm.isDeleted = 0 AND p.isDeleted = 0 
      ${typeCondition}
      ORDER BY pm.uploadedOn DESC
    `;
    
    
    const [records] = await db.execute(query, [accID]);
    
    
    res.json({
      success: true,
      data: records
    });
    
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records'
    });
  }
};

// Get records by specific pet
export const getMedicalRecordsByPet = async (req, res) => {
  try {
    const { petID } = req.params;
    const { recordType } = req.query;
    const requesterId = Number(req.user?.id);
    const requesterRole = Number(req.user?.role || 0);

    if (!isStaffRole(requesterRole)) {
      const [petRows] = await db.execute(
        'SELECT accID FROM pet_tbl WHERE petID = ? AND isDeleted = 0 LIMIT 1',
        [petID]
      );

      if (!petRows.length) {
        return res.status(404).json({
          success: false,
          message: 'Pet not found'
        });
      }

      if (Number(petRows[0].accID) !== requesterId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only access records for your own pet.'
        });
      }
    }
    
    let typeCondition = '';
    if (recordType === 'lab') {
      typeCondition = 'AND pm.labTypeID = 1'; // Lab Record
    } else if (recordType === 'medical') {
      typeCondition = 'AND pm.labTypeID = 2'; // Medical History
    }
    
    const query = `
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
        pm.labTypeID,
        CASE 
          WHEN pm.labTypeID = 1 THEN 'lab'
          WHEN pm.labTypeID = 2 THEN 'medical'
        END as recordCategory
      FROM petmedical_tbl pm
      INNER JOIN pet_tbl p ON pm.petID = p.petID
      INNER JOIN labtype_tbl lt ON pm.labTypeID = lt.labType_ID
      LEFT JOIN petmedical_file_tbl pmf ON pm.petMedicalID = pmf.petmedicalID AND pmf.isDeleted = 0
      WHERE pm.petID = ? AND pm.isDeleted = 0 
      ${typeCondition}
      ORDER BY pm.uploadedOn DESC
    `;
    
    
    const [records] = await db.execute(query, [petID]);
    
    
    res.json({
      success: true,
      data: records
    });
    
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records'
    });
  }
};

// Download medical record file
// In medicalRecordsController.js - downloadMedicalRecord function
// In medicalRecordsController.js - downloadMedicalRecord function
export const downloadMedicalRecord = async (req, res) => {
  try {
    const { fileID: rawFileRef } = req.params;
    const fileRef = decodeURIComponent(String(rawFileRef || '').trim());
    const numericFileId = Number.parseInt(fileRef, 10);
    const requesterId = Number(req.user?.id);
    const requesterRole = Number(req.user?.role || 0);
    
    
    const queryById = `
      SELECT pmf.originalName, pmf.storedName, pmf.filePath, p.accID
      FROM petmedical_file_tbl pmf
      JOIN petmedical_tbl pm ON pm.petMedicalID = pmf.petmedicalID
      JOIN pet_tbl p ON p.petID = pm.petID
      WHERE pmf.fileID = ? AND pmf.isDeleted = 0
    `;

    const queryByStoredName = `
      SELECT pmf.originalName, pmf.storedName, pmf.filePath, p.accID
      FROM petmedical_file_tbl pmf
      JOIN petmedical_tbl pm ON pm.petMedicalID = pmf.petmedicalID
      JOIN pet_tbl p ON p.petID = pm.petID
      WHERE pmf.storedName = ? AND pmf.isDeleted = 0
    `;

    let files = [];
    if (Number.isFinite(numericFileId) && String(numericFileId) === fileRef) {
      const [rows] = await db.execute(queryById, [numericFileId]);
      files = rows;
    }

    if (files.length === 0) {
      const [rows] = await db.execute(queryByStoredName, [fileRef]);
      files = rows;
    }
    
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = files[0];

    if (!isStaffRole(requesterRole) && Number(file.accID) !== requesterId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have access to this file.'
      });
    }

    const cloudinaryPdfUrl = buildOptimizedPdfUrlFromStoredName(file.storedName, { attachment: true });
    if (cloudinaryPdfUrl) {
      try {
        const response = await axios.get(cloudinaryPdfUrl, { responseType: 'arraybuffer' });
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
        return res.send(Buffer.from(response.data));
      } catch (cloudinaryError) {
        console.warn('Cloudinary download failed, trying private signed URL:', cloudinaryError?.message);
      }
    }

    const privatePdfUrl = buildPrivatePdfUrlFromStoredName(file.storedName, { attachment: true });
    if (privatePdfUrl) {
      try {
        const response = await axios.get(privatePdfUrl, { responseType: 'arraybuffer' });
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
        return res.send(Buffer.from(response.data));
      } catch (privateFetchError) {
        console.warn('Cloudinary private signed download failed:', privateFetchError?.message);
      }
    }

    return res.status(404).json({
      success: false,
      message: 'File not available from Cloudinary'
    });
    
  } catch (error) {
    console.error('❌ Error downloading medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file'
    });
  }
};

// ADD THESE DEBUG ROUTES TO HELP TROUBLESHOOT:

// Debug route to check all records
export const debugAllRecords = async (req, res) => {
  try {
    
    // Check all petmedical records
    const [allRecords] = await db.execute(`
      SELECT 
        pm.petMedicalID, 
        pm.petID, 
        pm.recordTitle, 
        pm.labTypeID,
        lt.labType,
        p.petName,
        p.accID,
        a.firstName,
        a.lastName
      FROM petmedical_tbl pm
      LEFT JOIN pet_tbl p ON pm.petID = p.petID
      LEFT JOIN account_tbl a ON p.accID = a.accId
      LEFT JOIN labtype_tbl lt ON pm.labTypeID = lt.labType_ID
      WHERE pm.isDeleted = 0
    `);
    
    // Check all files
    const [allFiles] = await db.execute(`
      SELECT * FROM petmedical_file_tbl WHERE isDeleted = 0
    `);
    
    
    res.json({
      success: true,
      allRecords: allRecords,
      allFiles: allFiles,
      summary: {
        totalRecords: allRecords.length,
        totalFiles: allFiles.length,
        recordsByType: {
          lab: allRecords.filter(r => r.labTypeID === 1).length,
          medical: allRecords.filter(r => r.labTypeID === 2).length
        }
      }
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Debug route for specific user
export const debugUserRecords = async (req, res) => {
  try {
    const { accID } = req.params;
    
    
    // Get user's pets
    const [userPets] = await db.execute(`
      SELECT petID, petName FROM pet_tbl 
      WHERE accID = ? AND isDeleted = 0
    `, [accID]);
    
    
    // Get records for each pet
    const userRecords = [];
    for (const pet of userPets) {
      const [petRecords] = await db.execute(`
        SELECT pm.*, lt.labType 
        FROM petmedical_tbl pm
        LEFT JOIN labtype_tbl lt ON pm.labTypeID = lt.labType_ID
        WHERE pm.petID = ? AND pm.isDeleted = 0
      `, [pet.petID]);
      
      userRecords.push(...petRecords);
    }
    
    res.json({
      success: true,
      userPets: userPets,
      userRecords: userRecords,
      summary: {
        totalPets: userPets.length,
        totalRecords: userRecords.length
      }
    });
    
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({ error: error.message });
  }
};
