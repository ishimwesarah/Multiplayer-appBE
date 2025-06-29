// src/controllers/ai.controller.ts

import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as aiService from "../services/ai.service";

export const generateQuiz = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { topic, numQuestions } = req.body;

  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    res.status(400).json({ message: "A non-empty topic string is required." });
    return;
  }

  const questionCount = numQuestions ? parseInt(numQuestions, 10) : 5; // Default to 5 questions
  if (isNaN(questionCount) || questionCount < 1 || questionCount > 10) {
    res
      .status(400)
      .json({ message: "Number of questions must be between 1 and 10." });
    return;
  }

  try {
    console.log(
      `Generating AI quiz for topic: "${topic}" with ${questionCount} questions.`
    );

    const { questions, suggestedCategory } = await aiService.generateQuizWithAI(
      topic,
      questionCount
    );

    res.status(200).json({ questions, suggestedCategory });
  } catch (error: any) {
    console.error("Error in AI controller:", error);

    res
      .status(500)
      .json({
        message: "An error occurred while generating the quiz with AI.",
      });
  }
};
