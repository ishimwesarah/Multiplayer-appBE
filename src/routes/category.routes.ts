// src/routes/category.routes.ts
import { Router } from 'express';
import { createCategory, getAllCategories } from '../controllers/category.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { UserRole } from '../models/user.model'; // Corrected casing
import { createCategorySchema } from '../schemas/category.schema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for managing quiz categories
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Science Fiction
 *     responses:
 *       201:
 *         description: Category created successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an Admin).
 *       409:
 *         description: Category with this name already exists.
 */
router.post(
  '/',
  protect,
  restrictTo(UserRole.ADMIN),
  validate(createCategorySchema),
  createCategory
);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get a list of all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of all categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
router.get('/', getAllCategories);

export default router;