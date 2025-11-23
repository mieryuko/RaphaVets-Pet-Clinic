import express from 'express';
import { 
  getMedicalRecordsByUser, 
  getMedicalRecordsByPet, 
  downloadMedicalRecord,
  debugAllRecords,
  debugUserRecords
} from '../controllers/labRecordsController.js';
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();

// Get all medical records for a user
router.get('/user/:accID', verifyToken, getMedicalRecordsByUser);

// Get all medical records for a specific pet
router.get('/pet/:petID', verifyToken, getMedicalRecordsByPet);

// Download medical record file
router.get('/download/:fileID', verifyToken, downloadMedicalRecord);

// Debug routes
router.get('/debug/all', debugAllRecords);
router.get('/debug/user/:accID', debugUserRecords);

export default router;