import Joi from 'joi';

import { uuid } from './custom.validation.js';

const paginationQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().pattern(/^(createdAt|priceCents|name):(asc|desc)$/).optional()
};

export const listAllProducts = {
  query: Joi.object({
    ...paginationQuery,
    category: Joi.string().min(1).max(100).optional(),
    brand: Joi.string().min(1).max(120).optional(),
    sellerId: uuid.optional()
  })
};

export const listSellerProducts = {
  query: Joi.object({
    ...paginationQuery,
    sellerId: uuid.optional()
  })
};

export const createSellerProduct = {
  body: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    category: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(5000).optional(),
    brand: Joi.string().max(120).optional(),
    priceCents: Joi.number().integer().min(0).required(),
    stockQuantity: Joi.number().integer().min(0).required(),
    sellerId: uuid.optional()
  }).required()
};

export const updateSellerProduct = {
  params: Joi.object({
    productId: uuid.required()
  }),
  body: Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    category: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(5000).allow(null).optional(),
    brand: Joi.string().max(120).allow(null).optional(),
    priceCents: Joi.number().integer().min(0).optional(),
    stockQuantity: Joi.number().integer().min(0).optional()
  })
    .min(1)
    .required()
};

export const deleteSellerProduct = {
  params: Joi.object({
    productId: uuid.required()
  })
};

