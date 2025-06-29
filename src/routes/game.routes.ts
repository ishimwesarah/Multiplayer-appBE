// src/routes/game.routes.ts
import { Router } from 'express';
import { createGame } from '../controllers/game.controller';
import { UserRole } from '../models/user.model'; 
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: API for starting and managing live game sessions
 */

/**
 * @swagger
 * /games/{quizId}/start:
 *   post:
 *     summary: Start a new game session and generate a PIN
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the quiz to start a game for.
 *     responses:
 *       201:
 *         description: Game session created, returns the game PIN.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pin:
 *                   type: string
 *                   example: "123456"
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Failed to create game (e.g., quiz not found).
 */
router.post('/:quizId/start', protect, restrictTo(UserRole.CREATOR, UserRole.ADMIN), createGame);
// router.post('/join', joinGame);

// router.get('/:pin/results', getGameResults);

export default router;