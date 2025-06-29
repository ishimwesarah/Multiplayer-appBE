// src/controllers/quiz.controller.ts
import { Response } from 'express';
import * as quizService from '../services/quiz.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Quiz, QuizStatus } from '../models/quiz.model';
import { Category } from '../models/category.model';

export const createNewQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  // --- Get categoryName from the body ---
  const { title, questions, categoryName } = req.body;
  const creatorId = req.user!.id;

  try {
    // --- Pass categoryName to the service ---
    const quiz = await quizService.createQuiz(title, creatorId, categoryName, questions);
    // The service now handles all the category logic
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create quiz', error });
  }
};
export const getAvailableQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as QuizStatus | undefined;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined; // <-- Get categoryId from query
    const quizzes = await quizService.findQuizzesForUser(req.user!, status, categoryId); // <-- Pass it
    res.status(200).json(quizzes);
  } catch (error) {
    // FIX: Removed 'return' from res.status()
    res.status(500).json({ message: 'Failed to fetch quizzes', error });
  }
};

export const requestPublic = async (req: AuthRequest, res: Response): Promise<void> => {
    const quizId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    try {
        const quiz = await quizService.requestQuizApproval(quizId, userId);
        res.status(200).json(quiz);
    } catch (error: any) {
        // FIX: Removed 'return' from res.status()
        res.status(404).json({ message: error.message });
    }
};

export const approvePublic = async (req: AuthRequest, res: Response): Promise<void> => {
    const quizId = parseInt(req.params.id, 10);
    try {
        const quiz = await quizService.approveQuiz(quizId);
        res.status(200).json(quiz);
    } catch (error: any) {
        // FIX: Removed 'return' from res.status()
        res.status(404).json({ message: error.message });
    }
};

export const getQuizDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const quizId = parseInt(req.params.id, 10);

        // --- FIX IS HERE: VALIDATE THE ID ---
        if (isNaN(quizId)) {
            res.status(400).json({ message: 'Invalid Quiz ID provided.' });
            return; // Stop execution
        }

        const quiz = await quizService.findQuizById(quizId);

        if (!quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        const user = req.user!;
        if (quiz.status === 'PRIVATE' && quiz.creatorId !== user.id && user.role !== 'ADMIN') {
            res.status(403).json({ message: 'You do not have permission to view this quiz.' });
            return;
        }

        res.status(200).json(quiz);
    } catch (error) {
        // It's better to log the error on the server for debugging
        console.error("Error fetching quiz details:", error);
        res.status(500).json({ message: 'Failed to fetch quiz details' });
    }
};
export const getMyQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const creatorId = req.user!.id;
    // Find all quizzes created by the current user, only return essential fields
    const quizzes = await Quiz.findAll({
      where: { creatorId },
      attributes: ['id', 'title', 'status'],
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your quizzes', error });
  }
};

export const updateExistingQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    const { title, questions, categoryName } = req.body;
    
    if (isNaN(quizId)) {
      res.status(400).json({ message: 'Invalid Quiz ID.' });
      return;
    }

    const updatedQuiz = await quizService.updateQuiz(quizId, userId, { title, categoryName, questions });
    res.status(200).json(updatedQuiz);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteSingleQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizId = parseInt(req.params.id, 10);
    const userId = req.user!.id;

    if (isNaN(quizId)) {
        res.status(400).json({ message: 'Invalid Quiz ID.' });
        return;
    }

    await quizService.deleteQuiz(quizId, userId);
    res.status(204).send(); // 204 No Content is standard for a successful delete
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};