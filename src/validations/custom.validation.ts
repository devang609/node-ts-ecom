import Joi from 'joi';

export const uuid = Joi.string().guid({ version: ['uuidv4'] });

export const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Za-z]/, 'letter')
  .pattern(/[0-9]/, 'number')
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must be at most 128 characters',
    'string.pattern.name': 'Password must contain at least one {#name}'
  });
