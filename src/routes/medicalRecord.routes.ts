import { Router } from 'express';
import * as mrController from '../controllers/medicalRecord.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';
import multer from 'multer';
import { env } from '../config/env';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(env.MAX_FILE_SIZE, 10),
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Validations
const entrySchema = z.object({
    medicalRecordId: z.string().uuid(),
    appointmentId: z.string().uuid().optional().nullable(),
    treatmentTypeId: z.string().uuid(),
    date: z.string().transform((val) => new Date(val)),
    doctorReport: z.string().optional(),
});

const entryUpdateSchema = entrySchema.partial().extend({
    doctorReport: z.string().nullable().optional(),
});

router.use(authenticate);

/**
 * @swagger
 * /medical-records/patient/{patientId}:
 *   get:
 *     tags: [Medical Records]
 *     summary: Get medical record by patient ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Medical record with entries
 */
router.get('/patient/:patientId', mrController.getByPatientId);

/**
 * @swagger
 * /medical-records/{id}/entries:
 *   get:
 *     tags: [Medical Records]
 *     summary: Get medical record entries
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of medical record entries
 */
router.get('/:id/entries', mrController.getEntries);

/**
 * @swagger
 * /medical-records/entries:
 *   post:
 *     tags: [Medical Records]
 *     summary: Create a new medical record entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicalRecordId
 *               - treatmentTypeId
 *               - date
 *             properties:
 *               medicalRecordId:
 *                 type: string
 *                 format: uuid
 *               appointmentId:
 *                 type: string
 *                 format: uuid
 *               treatmentTypeId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *               doctorReport:
 *                 type: string
 *               attachedFile:
 *                 type: object
 *                 properties:
 *                   fileName:
 *                     type: string
 *                   fileData:
 *                     type: string
 *                     description: Base64 encoded file
 *                   fileType:
 *                     type: string
 *                   uploadedAt:
 *                     type: string
 *     responses:
 *       201:
 *         description: Medical record entry created
 */
router.post('/entries', validate(entrySchema), mrController.createEntry);

/**
 * @swagger
 * /medical-records/entries/{id}:
 *   put:
 *     tags: [Medical Records]
 *     summary: Update medical record entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               treatmentTypeId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *               doctorReport:
 *                 type: string
 *               attachedFile:
 *                 type: object
 *     responses:
 *       200:
 *         description: Medical record entry updated
 */
router.put('/entries/:id', validate(entryUpdateSchema), mrController.updateEntry);

/**
 * @swagger
 * /medical-records/entries/{entryId}/files:
 *   post:
 *     tags: [Medical Records]
 *     summary: Upload a file to a medical record entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or file too large
 */
router.post('/entries/:entryId/files', upload.single('file'), mrController.uploadFile);

/**
 * @swagger
 * /medical-records/files/{fileId}:
 *   get:
 *     tags: [Medical Records]
 *     summary: Download a file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 */
router.get('/files/:fileId', mrController.downloadFile);

/**
 * @swagger
 * /medical-records/files/{fileId}:
 *   delete:
 *     tags: [Medical Records]
 *     summary: Delete a file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */
router.delete('/files/:fileId', mrController.deleteFile);

export default router;

