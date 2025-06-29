// import { Question, Quiz } from '../models/user.model';
// import { AppDataSource } from '../config/database';

// export class QuestionService {
//   private questionRepository = AppDataSource.getRepository(Question);
//   private quizRepository = AppDataSource.getRepository(Quiz);

//   async createQuestion(
//     quizId: string,
//     text: string,
//     options: string[],
//     correctAnswer: number,
//     timeLimit: number = 30,
//     points: number = 1000
//   ) {
//     const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
//     if (!quiz) {
//       throw new Error('Quiz not found');
//     }

//     if (correctAnswer < 0 || correctAnswer >= options.length) {
//       throw new Error('Invalid correct answer index');
//     }

//     const question = this.questionRepository.create({
//       text,
//       options,
//       correctAnswer,
//       timeLimit,
//       points,
//       quiz,
//     });

//     await this.questionRepository.save(question);
//     return question;
//   }

//   async getQuestionById(id: string) {
//     return this.questionRepository.findOne({
//       where: { id },
//       relations: ['quiz'],
//     });
//   }

//   async getQuizQuestions(quizId: string) {
//     return this.questionRepository.find({
//       where: { quiz: { id: quizId } },
//     });
//   }

//   async updateQuestion(id: string, updates: Partial<Question>) {
//     if (updates.correctAnswer !== undefined && updates.options !== undefined) {
//       if (updates.correctAnswer < 0 || updates.correctAnswer >= updates.options.length) {
//         throw new Error('Invalid correct answer index');
//       }
//     }

//     await this.questionRepository.update(id, updates);
//     return this.questionRepository.findOne({ where: { id } });
//   }

//   async deleteQuestion(id: string) {
//     const result = await this.questionRepository.delete(id);
//     return result.affected > 0;
//   }
// }