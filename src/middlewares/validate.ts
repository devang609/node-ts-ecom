import type { RequestHandler } from 'express';
import Joi from 'joi';

import httpStatus from 'http-status';

import { ApiError } from '../utils/ApiError.js';
import { pick } from '../utils/pick.js';

type ReqSegment = 'params' | 'query' | 'body';

export type RequestSchema = Partial<Record<ReqSegment, Joi.ObjectSchema>>;

export function validate(schema: RequestSchema): RequestHandler {
  return (req, _res, next) => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const objectToValidate = pick(req, Object.keys(validSchema) as ReqSegment[]);

    const { value, error } = Joi.compile(validSchema)
      .prefs({ abortEarly: false, errors: { label: 'key' } })
      .validate(objectToValidate);

    if (error) {
      const message = error.details.map((details) => details.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, message));
    }

    Object.assign(req, value);
    return next();
  };
}

