import { Router } from 'express';
import * as mrController from '../controllers/medicalRecord.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

// Validations
const attachedFileSchema = z.object({
    fileName: z.string(),
    fileData: z.string(), // Base64
    fileType: z.string(),
    uploadedAt: z.string()
}).optional().nullable();

const entrySchema = z.object({
    medicalRecordId: z.string().uuid(),
    appointmentId: z.string().uuid().optional().nullable(),
    treatmentTypeId: z.string().uuid(),
    date: z.string().transform((val) => new Date(val)),
    doctorReport: z.string().optional(),
    attachedFile: attachedFileSchema
});

const entryUpdateSchema = entrySchema.partial();

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

export default router;

