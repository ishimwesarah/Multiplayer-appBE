// import { Request, Response } from 'express';
// import { QuestionService } from '../services/question.service';
// import { createQuestionSchema, updateQuestionSchema } from '../schemas/question.schema';

// export class QuestionController {
//   private questionService = new QuestionService();

//   async createQuestion(req: Request, res: Response) {
//     try {
//       const { error } = createQuestionSchema.validate(req.body);
//       if (error) {
//         return res.status(400).json({ error: error.details[0].message });
//       }

//       const { text, options, correctAnswer, timeLimit, points } = req.body;
//       const question = await this.questionService.createQuestion(
//         req.params.quizId,
//         text,
//         options,
//         correctAnswer,
//         timeLimit,
//         points
//       );
//       res.status(201).json(question);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }

//   async getQuestionById(req: Request, res: Response) {
//     try {
//       const question = await this.questionService.getQuestionById(req.params.id);
//       if (!question) {
//         return res.status(404).json({ error: 'Question not found' });
//       }
//       res.json(question);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }

//   async getQuizQuestions(req: Request, res: Response) {
//     try {
//       const questions = await this.questionService.getQuizQuestions(req.params.quizId);
//       res.json(questions);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }

//   async updateQuestion(req: Request, res: Response) {
//     try {
//       const { error } = updateQuestionSchema.validate(req.body);
//       if (error) {
//         return res.status(400).json({ error: error.details[0].message });
//       }

//       const question = await this.questionService.updateQuestion(req.params.id, req.body);
//       if (!question) {
//         return res.status(404).json({ error: 'Question not found' });
//       }
//       res.json(question);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }

//   async deleteQuestion(req: Request, res: Response) {
//     try {
//       const success = await this.questionService.deleteQuestion(req.params.id);
//       if (!success) {
//         return res.status(404).json({ error: 'Question not found' });
//       }
//       res.json({ success: true });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// }