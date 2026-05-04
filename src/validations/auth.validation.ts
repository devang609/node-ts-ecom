import Joi from 'joi';

import type { RequestSchema } from '../middlewares/validate.js';
import { password } from './custom.validation.js';

export const register: RequestSchema = {
  body: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: password.required()
  }).required()
};

export const login: RequestSchema = {
  body: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().required()
  }).required()
};

export const refresh: RequestSchema = {};

export const logout: RequestSchema = {};

