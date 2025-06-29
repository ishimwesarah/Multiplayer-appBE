// src/routes/quiz.routes.ts
import { Router } from 'express';
import {
  createNewQuiz,
  getAvailableQuizzes,
  requestPublic,
  approvePublic,
  getQuizDetails,
  getMyQuizzes,
  deleteSingleQuiz,
  updateExistingQuiz
} from '../controllers/quiz.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model'; // Corrected casing
import { validate } from '../middlewares/validate.middleware';
import { createQuizSchema } from '../schemas/quiz.schema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Quizzes
 *   description: API for creating and managing quizzes
 */

/**
 * @swagger
 * /quizzes:
 *   get:
 *     summary: Get a list of available quizzes
 *     description: Admins see all quizzes and can filter by status. Creators see their own quizzes plus all public ones.
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PRIVATE, PENDING_APPROVAL, PUBLIC]
 *         description: Filter quizzes by status (Admin only).
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter quizzes by a specific category ID.
 *     responses:
 *       200:
 *         description: A list of quizzes.
 *       401:
 *         description: Unauthorized.
 */
router.get(
    '/',
    protect,
    restrictTo(UserRole.ADMIN, UserRole.CREATOR),
    getAvailableQuizzes
);

/**
 * @swagger
 * /quizzes:
 *   post:
 *     summary: Create a new quiz
 *     description: Quizzes are created with a 'PRIVATE' status by default.
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuiz'
 *     responses:
 *       201:
 *         description: Quiz created successfully.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  '/',
  protect,
  restrictTo(UserRole.ADMIN, UserRole.CREATOR),
  validate(createQuizSchema),
  createNewQuiz
);

/**
 * @swagger
 * /quizzes/{id}/request-public:
 *   patch:
 *     summary: Request a private quiz to be made public
 *     description: Changes the quiz status from PRIVATE to PENDING_APPROVAL. Only the quiz owner can do this.
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Approval request sent successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Quiz not found or you do not have permission.
 */
router.patch(
    '/:id/request-public',
    protect,
    restrictTo(UserRole.CREATOR, UserRole.ADMIN),
    requestPublic
);

/**
 * @swagger
 * /quizzes/{id}/approve:
 *   patch:
 *     summary: Approve a quiz to make it public (Admin only)
 *     description: Changes the quiz status to PUBLIC.
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Quiz approved and is now public.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an Admin).
 *       404:
 *         description: Quiz not found.
 */
router.patch(
    '/:id/approve',
    protect,
    restrictTo(UserRole.ADMIN),
    approvePublic
);
/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     summary: Get full details of a single quiz
 *     description: Retrieves a single quiz by its ID, including all of its questions and their options. A user can view any public quiz, but only the owner or an admin can view a private quiz.
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the quiz to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the quiz details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "World Capitals"
 *                 status:
 *                   type: string
 *                   enum: [PRIVATE, PENDING_APPROVAL, PUBLIC]
 *                   example: "PUBLIC"
 *                 creator:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Test Creator"
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Geography"
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       text:
 *                         type: string
 *                         example: "What is the capital of Canada?"
 *                       quizId:
 *                         type: integer
 *                         example: 1
 *                       options:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             text:
 *                               type: string
 *                               example: "Ottawa"
 *                             isCorrect:
 *                               type: boolean
 *                               example: true
 *                             questionId:
 *                               type: integer
 *                               example: 1
 *       403:
 *         description: Forbidden. User does not have permission to view this quiz.
 *       404:
 *         description: Quiz not found.
 */
router.get(
    '/:id',
    protect,
    restrictTo(UserRole.ADMIN, UserRole.CREATOR),
    getQuizDetails
);

/**
 * @swagger
 * /quizzes/my-quizzes:
 *   get:
 *     summary: Get quizzes created by the logged-in user
 *     description: Fetches a simple list of quizzes created by the currently authenticated user.
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's quizzes.
 *       401:
 *         description: Unauthorized.
 */
router.get(
    '/my-quizzes',
    protect, // User must be logged in
    restrictTo(UserRole.ADMIN, UserRole.CREATOR),
    getMyQuizzes
);


/**
 * @swagger
 * /quizzes/{id}:
 *   put:
 *     summary: Update an existing quiz
 *     description: Updates a quiz's title, category, and questions. Only the owner can update their quiz.
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuiz'
 *     responses:
 *       200:
 *         description: Quiz updated successfully.
 *       404:
 *         description: Quiz not found or user lacks permission.
 */
router.put(
  '/:id',
  protect,
  restrictTo(UserRole.ADMIN, UserRole.CREATOR),
  validate(createQuizSchema), // Reuse the create schema for validation
  updateExistingQuiz
);

/**
 * @swagger
 * /quizzes/{id}:
 *   delete:
 *     summary: Delete a quiz
 *     description: Deletes a quiz. Only the owner can delete their quiz.
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Quiz deleted successfully.
 *       404:
 *         description: Quiz not found or user lacks permission.
 */
router.delete(
  '/:id',
  protect,
  restrictTo(UserRole.ADMIN, UserRole.CREATOR),
  deleteSingleQuiz
);


export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateQuiz:
 *       type: object
 *       required:
 *         - title
 *         - categoryName
 *         - questions
 *       properties:
 *         title:
 *           type: string
 *           example: "World Capitals"
 *         categoryName:
 *           type: string
 *           example: "Geography"
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - text
 *               - options
 *             properties:
 *               text:
 *                 type: string
 *                 example: "What is the capital of Canada?"
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - text
 *                     - isCorrect
 *                   properties:
 *                     text:
 *                       type: string
 *                       example: "Ottawa"
 *                     isCorrect:
 *                       type: boolean
 *                       example: true
 */