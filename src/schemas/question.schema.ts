import Joi from 'joi';

export const createQuestionSchema = Joi.object({
  text: Joi.string().required(),
  options: Joi.array().items(Joi.string()).min(2).required(),
  correctAnswer: Joi.number().integer().min(0).required(),
  timeLimit: Joi.number().integer().min(5).max(60).default(30),
  points: Joi.number().integer().min(100).max(2000).default(1000),
});

export const updateQuestionSchema = Joi.object({
  text: Joi.string(),
  options: Joi.array().items(Joi.string()).min(2),
  correctAnswer: Joi.number().integer().min(0),
  timeLimit: Joi.number().integer().min(5).max(60),
  points: Joi.number().integer().min(100).max(2000),
});