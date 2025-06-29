// src/services/quiz.service.ts
import { sequelize } from '../config/database';
import { Quiz, QuizStatus } from '../models/quiz.model';
import { Question } from '../models/question.model';
import { Option } from '../models/option.model';
import { User, UserRole } from '../models/user.model';
import { Op } from 'sequelize'; // <-- Import Op for OR queries
import { Category } from '../models/category.model';

// --- UPDATE createQuiz ---
export const createQuiz = async (
  title: string,
  creatorId: number,
  categoryName: string, // <-- Change parameter from categoryId to categoryName
  questions: { text: string; options: { text: string; isCorrect: boolean }[] }[]
) => {
  const t = await sequelize.transaction();
  try {
    // --- USE THE NEW HELPER FUNCTION ---
    const category = await findOrCreateCategory(categoryName);

    // Now use the category's ID to create the quiz
    const quiz = await Quiz.create(
        { title, creatorId, categoryId: category.id }, // <-- Use the found/created category.id
        { transaction: t }
    );

    for (const q of questions) {
      const question = await Question.create(
        { text: q.text, quizId: quiz.id },
        { transaction: t }
      );
      await Option.bulkCreate(
        q.options.map(opt => ({ ...opt, questionId: question.id })),
        { transaction: t }
      );
    }

    await t.commit();
    return quiz;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};


export const findQuizzesForUser = (user: User, status?: QuizStatus, categoryId?: number) => { // <-- Add categoryId
  const whereClause: any = {};

  if (user.role === UserRole.ADMIN) {
    if (status) whereClause.status = status;
  } else {
    whereClause[Op.or] = [
      { creatorId: user.id },
      { status: QuizStatus.PUBLIC }
    ];
  }

  // Add the category filter if it's provided
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  return Quiz.findAll({
    where: whereClause,
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name'] },
      { model: Category, as: 'category' } 
    ],
    order: [['createdAt', 'DESC']]
  });
};
export const requestQuizApproval = async (quizId: number, userId: number) => {
  const quiz = await Quiz.findOne({ where: { id: quizId, creatorId: userId } });
  if (!quiz) {
    // Throws an error if the quiz doesn't exist or doesn't belong to the user
    throw new Error('Quiz not found or you do not have permission to edit this quiz.');
  }
  quiz.status = QuizStatus.PENDING_APPROVAL;
  await quiz.save();
  return quiz;
};

export const approveQuiz = async (quizId: number) => {
  const quiz = await Quiz.findByPk(quizId);
  if (!quiz) {
    throw new Error('Quiz not found.');
  }
  quiz.status = QuizStatus.PUBLIC;
  await quiz.save();
  return quiz;
};

const findOrCreateCategory = async (name: string): Promise<Category> => {
  // Use findOne with a case-insensitive search to prevent duplicates like "Art" and "art"
  const [category, created] = await Category.findOrCreate({
    where: { name: { [Op.iLike]: name } },
    defaults: { name: name.trim() } // Use the provided name for creation
  });
  return category;
};

// --- ADD THIS NEW FUNCTION ---
/**
 * Finds a single quiz by its ID and includes all its nested data.
 * @param quizId The ID of the quiz to find.
 * @returns A promise that resolves to the Quiz object with its questions and options.
 */
export const findQuizById = async (quizId: number) => {
  const quiz = await Quiz.findByPk(quizId, {
    include: [
      // Include the questions associated with the quiz
      {
        model: Question,
        as: 'questions',
        // For each question, also include its options
        include: [
          {
            model: Option,
            as: 'options',
            // We can exclude timestamps from the options for a cleaner response
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
        ],
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      },
      // Also include creator and category info
      { model: User, as: 'creator', attributes: ['id', 'name'] },
      { model: Category, as: 'category', attributes: ['id', 'name'] },
    ],
  });

  return quiz;
};

export const updateQuiz = async (
  quizId: number,
  userId: number,
  data: { title: string; categoryName: string; questions: { text: string; options: { text: string; isCorrect: boolean }[] }[] }
) => {
  const t = await sequelize.transaction();
  try {
    const quiz = await Quiz.findOne({ where: { id: quizId, creatorId: userId } });
    if (!quiz) {
      throw new Error('Quiz not found or you do not have permission to edit this quiz.');
    }

    // Find or create the category
    const category = await findOrCreateCategory(data.categoryName);

    // Update quiz title and category
    quiz.title = data.title;
    quiz.categoryId = category.id;
    await quiz.save({ transaction: t });

    // Delete old questions associated with the quiz
    // This will cascade and delete the options as well
    await Question.destroy({ where: { quizId: quiz.id }, transaction: t });

    // Create new questions and options
    for (const q of data.questions) {
      const question = await Question.create(
        { text: q.text, quizId: quiz.id },
        { transaction: t }
      );
      await Option.bulkCreate(
        q.options.map(opt => ({ ...opt, questionId: question.id })),
        { transaction: t }
      );
    }

    await t.commit();
    return await findQuizById(quiz.id); // Return the updated quiz with all details
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Deletes a quiz and its associated questions and options.
 */
export const deleteQuiz = async (quizId: number, userId: number): Promise<void> => {
  const quiz = await Quiz.findOne({ where: { id: quizId, creatorId: userId } });
  if (!quiz) {
    throw new Error('Quiz not found or you do not have permission to delete this quiz.');
  }

  // Sequelize will handle cascading deletes if set up correctly in models,
  // but explicit deletion is safer. Questions and options will be deleted
  // because the quizId foreign key is removed.
  await quiz.destroy();
};