import winston from 'winston';

import { config } from './config.js';

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    return {
      ...info,
      message: info.message,
      stack: info.stack
    };
  }

  if (info.error instanceof Error) {
    return {
      ...info,
      error: {
        message: info.error.message,
        stack: info.error.stack,
        name: info.error.name
      }
    };
  }

  return info;
});

export const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console({ stderrLevels: ['error'] })]
});

