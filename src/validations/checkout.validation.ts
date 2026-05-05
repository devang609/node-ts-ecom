import Joi from 'joi';

import { uuid } from './custom.validation.js';

export const buy = {
  body: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: uuid.required(),
          quantity: Joi.number().integer().min(1).required()
        }).required()
      )
      .min(1)
      .required()
  }).required()
};

