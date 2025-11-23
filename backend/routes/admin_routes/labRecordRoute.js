// routes/petMedicalRoutes.js
import express from 'express';
import { createMulter } from '../../middleware/multer.js';
import {
  uploadMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordsByPet,
  serveMedicalRecord,
  getLabTypes
} from '../../controllers/admin_controllers/labRecordController.js';
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/roleMiddleware.js";


const router = express.Router();

// Configure multer for PDF uploads only
const upload = createMulter('medical_records', ['application/pdf'], 10); // 10MB max size

// Routes - Remove the duplicate "medical-records" prefix
router.get('/lab-types', verifyToken, allowRoles(2, 3), getLabTypes)
router.post('/upload', upload.single('file'), verifyToken, allowRoles(2, 3), uploadMedicalRecord);
router.get('/lab-records', verifyToken, allowRoles(2, 3), getMedicalRecords);
router.get('/pet/:petId', verifyToken, allowRoles(2, 3), getMedicalRecordsByPet);
router.get('/file/:filename', verifyToken, allowRoles(2, 3), serveMedicalRecord);
router.get('/:id', verifyToken, allowRoles(2, 3), getMedicalRecordById);
router.put('/:id', verifyToken, allowRoles(2, 3), upload.single('file'), updateMedicalRecord);
router.delete('/:id', verifyToken, allowRoles(2, 3), deleteMedicalRecord);


export default router;