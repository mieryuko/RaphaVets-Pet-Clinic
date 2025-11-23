import db from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all medical records for a user (across all their pets)
export const getMedicalRecordsByUser = async (req, res) => {
  try {
    const { accID } = req.params;
    const { recordType } = req.query;
    
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
    
    console.log('🔍 Executing query for user:', accID, 'recordType:', recordType);
    console.log('📊 Query:', query);
    
    const [records] = await db.execute(query, [accID]);
    
    console.log('✅ Records found:', records);
    
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
    
    console.log('🔍 Executing query for pet:', petID, 'recordType:', recordType);
    console.log('📊 Query:', query);
    
    const [records] = await db.execute(query, [petID]);
    
    console.log('✅ Records found for pet:', records);
    
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
    const { fileID } = req.params;
    
    console.log("🔍 Download request for fileID:", fileID);
    
    const query = `
      SELECT originalName, storedName, filePath 
      FROM petmedical_file_tbl 
      WHERE fileID = ? AND isDeleted = 0
    `;
    
    const [files] = await db.execute(query, [fileID]);
    
    console.log("📁 Files found:", files);
    
    if (files.length === 0) {
      console.log("❌ No file found with ID:", fileID);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = files[0];
    console.log("📄 File details:", file);
    
    // FIX: Use filePath directly - it's already the full path including filename
    const filePath = file.filePath;
    
    console.log("📍 Final file path:", filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log("❌ File not found at path:", filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    console.log("✅ File exists, proceeding with download...");
    
    // Determine content type based on file extension
    const ext = path.extname(file.originalName).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
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
    console.log('🔧 DEBUG: Checking all medical records in database');
    
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
    
    console.log('📋 All medical records:', allRecords);
    console.log('📁 All files:', allFiles);
    
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
    
    console.log(`🔧 DEBUG: Checking records for user ${accID}`);
    
    // Get user's pets
    const [userPets] = await db.execute(`
      SELECT petID, petName FROM pet_tbl 
      WHERE accID = ? AND isDeleted = 0
    `, [accID]);
    
    console.log(`🐕 User ${accID} pets:`, userPets);
    
    // Get records for each pet
    const userRecords = [];
    for (const pet of userPets) {
      const [petRecords] = await db.execute(`
        SELECT pm.*, lt.labType 
        FROM petmedical_tbl pm
        LEFT JOIN labtype_tbl lt ON pm.labTypeID = lt.labType_ID
        WHERE pm.petID = ? AND pm.isDeleted = 0
      `, [pet.petID]);
      
      console.log(`📄 Records for pet ${pet.petName}:`, petRecords);
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