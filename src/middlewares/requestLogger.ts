import type { RequestHandler } from 'express';

import { logger } from '../config/logger.js';

export const requestLogger: RequestHandler = (req, res, next) => {
  const startTimeMs = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTimeMs;
    logger.info('Request completed', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs
    });
  });

  next();
};

