// src/schemas/quiz.schema.ts
import { z } from 'zod';

const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  text: z.string().min(1),
  options: z.array(optionSchema).min(2).max(4),
});

export const createQuizSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    // The `isPublic` or `status` field is removed from here.
    // A quiz is always created as PRIVATE.
   categoryName: z.string().min(2, 'Category name is required.'),
    questions: z.array(z.object({
        text: z.string().min(1),
        options: z.array(z.object({
            text: z.string().min(1),
            isCorrect: z.boolean(),
        })).min(2).max(4),
    })).min(1),
  }),
});