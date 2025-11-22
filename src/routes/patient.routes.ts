import { Router } from 'express';
import * as patientController from '../controllers/patient.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const patientBaseSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().optional(),
  dateOfBirth: z.string().transform((val) => {
    // Handle both ISO datetime and YYYY-MM-DD formats
    const date = new Date(val);
    // Ensure it's a valid date
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date;
  }),
  hasPayrollDeduction: z.boolean().default(false),
  companyName: z.string().optional(),
});

const patientSchema = patientBaseSchema.refine((data) => {
    if (data.hasPayrollDeduction && !data.companyName) {
        return false;
    }
    return true;
}, {
    message: "Company name is required for payroll deduction",
    path: ["companyName"]
});

const patientUpdateSchema = patientBaseSchema.partial();

router.use(authenticate);

/**
 * @swagger
 * /patients:
 *   get:
 *     tags: [Patients]
 *     summary: Get all patients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patient'
 */
router.get('/', patientController.getAll);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient by ID
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
 *         description: Patient details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient not found
 */
router.get('/:id', patientController.getById);

/**
 * @swagger
 * /patients:
 *   post:
 *     tags: [Patients]
 *     summary: Create a new patient
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phone
 *               - email
 *               - dateOfBirth
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               hasPayrollDeduction:
 *                 type: boolean
 *                 default: false
 *               companyName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       409:
 *         description: Email already exists
 */
router.post('/', validate(patientSchema), patientController.create);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     tags: [Patients]
 *     summary: Update patient
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               hasPayrollDeduction:
 *                 type: boolean
 *               companyName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 */
router.put('/:id', validate(patientUpdateSchema), patientController.update);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     tags: [Patients]
 *     summary: Delete patient
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
 *         description: Patient deleted
 */
router.delete('/:id', patientController.remove);

export default router;

