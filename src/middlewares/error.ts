import type { ErrorRequestHandler } from 'express';

import httpStatus from 'http-status';

import { config } from '../config/config.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

type ErrorLike = { message?: unknown; name?: unknown; stack?: unknown };

function isErrorLike(value: unknown): value is ErrorLike {
  return typeof value === 'object' && value !== null;
}

export const errorConverter: ErrorRequestHandler = (err, _req, _res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const errorLike = isErrorLike(error) ? error : {};
    const errorName = typeof errorLike.name === 'string' ? errorLike.name : '';

    const isSequelizeBadRequest =
      errorName === 'SequelizeValidationError' ||
      errorName === 'SequelizeUniqueConstraintError' ||
      errorName === 'SequelizeForeignKeyConstraintError';

    const statusCode = isSequelizeBadRequest ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = typeof errorLike.message === 'string' ? errorLike.message : httpStatus[statusCode];
    const stack = typeof errorLike.stack === 'string' ? errorLike.stack : '';

    error = new ApiError(statusCode, message, false, stack);
  }

  next(error);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const apiError = err as ApiError;

  let { statusCode, message } = apiError;

  if (config.env === 'production' && !apiError.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  logger.error('Request failed', { error: apiError });

  res.status(statusCode).json({
    code: statusCode,
    message,
    ...(config.env === 'development' ? { stack: apiError.stack } : {})
  });
};
