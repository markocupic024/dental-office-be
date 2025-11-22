import { Router } from 'express';
import * as ttController from '../controllers/treatmentType.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const typeSchema = z.object({
    label: z.string().min(1)
});

router.use(authenticate);

/**
 * @swagger
 * /treatment-types:
 *   get:
 *     tags: [Treatment Types]
 *     summary: Get all treatment types
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of treatment types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TreatmentType'
 */
router.get('/', ttController.getAll);

/**
 * @swagger
 * /treatment-types:
 *   post:
 *     tags: [Treatment Types]
 *     summary: Create a new treatment type
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       201:
 *         description: Treatment type created
 *       409:
 *         description: Treatment type already exists
 */
router.post('/', validate(typeSchema), ttController.create);

/**
 * @swagger
 * /treatment-types/{id}:
 *   put:
 *     tags: [Treatment Types]
 *     summary: Update treatment type
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
 *             required:
 *               - label
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       200:
 *         description: Treatment type updated
 *       409:
 *         description: Treatment type already exists
 */
router.put('/:id', validate(typeSchema), ttController.update);

/**
 * @swagger
 * /treatment-types/{id}:
 *   delete:
 *     tags: [Treatment Types]
 *     summary: Delete treatment type
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
 *         description: Treatment type deleted
 *       409:
 *         description: Cannot delete treatment type used in appointments
 */
router.delete('/:id', ttController.remove);

export default router;

