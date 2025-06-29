// src/routes/ai.routes.ts

import { Router } from 'express';
import { generateQuiz } from '../controllers/ai.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: API for AI-powered features
 */

/**
 * @swagger
 * /ai/generate-quiz:
 *   post:
 *     summary: Generate a quiz using AI
 *     description: Creates a list of questions and answers based on a given topic. This is a protected route for creators and admins.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *                 description: The subject for the quiz.
 *                 example: "The Solar System"
 *               numQuestions:
 *                 type: integer
 *                 description: The number of questions to generate (default is 5, max is 10).
 *                 example: 5
 *     responses:
 *       200:
 *         description: Successfully generated quiz questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                         example: "Which planet is known as the Red Planet?"
 *                       options:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             text:
 *                               type: string
 *                               example: "Mars"
 *                             isCorrect:
 *                               type: boolean
 *                               example: true
 *       400:
 *         description: Bad request (e.g., topic is missing).
 *       401:
 *         description: Unauthorized (user is not logged in).
 *       500:
 *         description: Internal server error, failed to generate quiz.
 */
router.post(
  '/generate-quiz',
  protect, // Ensures the user is logged in
  restrictTo(UserRole.ADMIN, UserRole.CREATOR), // Only admins and creators can generate quizzes
  generateQuiz
);

export default router;