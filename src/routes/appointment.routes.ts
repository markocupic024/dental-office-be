import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const appointmentSchema = z.object({
    patientId: z.string().uuid().optional().nullable(),
    treatmentTypeId: z.string().uuid(),
    date: z.string().transform((val) => new Date(val)),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).refine((time) => {
        const minutes = parseInt(time.split(':')[1]);
        return minutes % 30 === 0;
    }, "Time must be in 30-minute intervals"),
    status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
    notes: z.string().optional(),
    payrollDeductionMonths: z.number().int().min(1).optional().nullable(),
    payrollDeductionAmount: z.number().min(0).optional().nullable()
});

const appointmentUpdateSchema = appointmentSchema.partial();

router.use(authenticate);

/**
 * @swagger
 * /appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Get all appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
 */
router.get('/', appointmentController.getAll);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointment by ID
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
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 */
router.get('/:id', appointmentController.getById);

/**
 * @swagger
 * /appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Create a new appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - time
 *               - treatmentTypeId
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               treatmentTypeId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *               notes:
 *                 type: string
 *               payrollDeductionMonths:
 *                 type: integer
 *               payrollDeductionAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Appointment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 */
router.post('/', validate(appointmentSchema), appointmentController.create);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     tags: [Appointments]
 *     summary: Update appointment
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
 *               patientId:
 *                 type: string
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               treatmentTypeId:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *               payrollDeductionMonths:
 *                 type: integer
 *               payrollDeductionAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Appointment updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 */
router.put('/:id', validate(appointmentUpdateSchema), appointmentController.update);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     tags: [Appointments]
 *     summary: Delete appointment
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
 *         description: Appointment deleted
 */
router.delete('/:id', appointmentController.remove);

export default router;

