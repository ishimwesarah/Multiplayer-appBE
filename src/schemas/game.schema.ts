import Joi from 'joi';

export const joinGameSchema = Joi.object({
  pin: Joi.string().length(6).required(),
  name: Joi.string().required(),
});