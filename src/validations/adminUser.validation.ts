import Joi from 'joi';

import { uuid } from './custom.validation.js';
import type { RequestSchema } from '../middlewares/validate.js';
import { password } from './custom.validation.js';

const paginationQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().pattern(/^(createdAt|email|role):(asc|desc)$/).optional()
};

export const listUsers: RequestSchema = {
  query: Joi.object({
    ...paginationQuery,
    role: Joi.string().valid('BUYER', 'SELLER', 'ADMIN').optional(),
    email: Joi.string().email({ tlds: { allow: false } }).optional()
  })
};

export const getUserById: RequestSchema = {
  params: Joi.object({
    userId: uuid.required()
  })
};

export const createUser: RequestSchema = {
  body: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: password.required()
  }).required()
};

export const updateUser: RequestSchema = {
  params: Joi.object({
    userId: uuid.required()
  }),
  body: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).optional(),
    password: password.optional(),
    role: Joi.string().valid('BUYER', 'SELLER').optional()
  })
    .min(1)
    .required()
};

export const deleteUser: RequestSchema = {
  params: Joi.object({
    userId: uuid.required()
  })
};

