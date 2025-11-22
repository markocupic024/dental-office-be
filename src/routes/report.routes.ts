import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
    type: z.enum(['daily', 'weekly', 'monthly', 'payrollDeduction']),
    date: z.string().transform(val => new Date(val)),
    companyName: z.string().optional()
});

router.use(authenticate);

/**
 * @swagger
 * /reports:
 *   get:
 *     tags: [Reports]
 *     summary: Get all reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, payrollDeduction]
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/', reportController.getAll);

/**
 * @swagger
 * /reports:
 *   post:
 *     tags: [Reports]
 *     summary: Generate a new report
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - date
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [daily, weekly, monthly, payrollDeduction]
 *               date:
 *                 type: string
 *                 format: date
 *               companyName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report generated
 */
router.post('/', validate(createSchema), reportController.create);

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     tags: [Reports]
 *     summary: Delete report
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
 *         description: Report deleted
 */
router.delete('/:id', reportController.remove);

export default router;

