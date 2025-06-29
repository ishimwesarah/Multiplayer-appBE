// src/routes/index.ts
import { Router } from 'express';
import authRouter from './auth.routes';
import quizRouter from './quiz.routes';
import gameRouter from './game.routes';
import categoryRouter from './category.routes';
import aiRouter from './ai.routes'
const router = Router();

router.use('/auth', authRouter);
router.use('/quizzes', quizRouter);
router.use('/games', gameRouter);
router.use('/categories', categoryRouter);
router.use('/ai', aiRouter);

export default router;