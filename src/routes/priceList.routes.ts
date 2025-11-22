import { Router } from 'express';
import * as priceController from '../controllers/priceList.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
    treatmentTypeId: z.string().uuid(),
    price: z.number().gt(0)
});

const updateSchema = z.object({
    price: z.number().gt(0)
});

router.use(authenticate);

/**
 * @swagger
 * /prices:
 *   get:
 *     tags: [Price List]
 *     summary: Get all price list items
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of price items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PriceListItem'
 */
router.get('/', priceController.getAll);

/**
 * @swagger
 * /prices:
 *   post:
 *     tags: [Price List]
 *     summary: Create a new price list item
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - treatmentTypeId
 *               - price
 *             properties:
 *               treatmentTypeId:
 *                 type: string
 *                 format: uuid
 *               price:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Price item created
 *       409:
 *         description: Price already exists for this treatment type
 */
router.post('/', validate(createSchema), priceController.create);

/**
 * @swagger
 * /prices/{id}:
 *   put:
 *     tags: [Price List]
 *     summary: Update price list item
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
 *               - price
 *             properties:
 *               price:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Price item updated
 */
router.put('/:id', validate(updateSchema), priceController.update);

/**
 * @swagger
 * /prices/{id}:
 *   delete:
 *     tags: [Price List]
 *     summary: Delete price list item
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
 *         description: Price item deleted
 */
router.delete('/:id', priceController.remove);

export default router;

