import winston from 'winston';
import { ENV } from '../config/env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return stack
    ? `[${ts}] ${level}: ${message}\n${stack}`
    : `[${ts}] ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: ENV.IS_PRODUCTION ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: ENV.IS_DEVELOPMENT
        ? combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat)
        : logFormat,
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});