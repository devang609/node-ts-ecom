import winston from 'winston';
import { ENV } from '../config/env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format: [timestamp] LEVEL: message (+ stack trace if error)
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return stack
    ? `[${ts}] ${level}: ${message}\n${stack}`
    : `[${ts}] ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: ENV.IS_PRODUCTION ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),   // Capture stack traces on Error objects
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: ENV.IS_DEVELOPMENT
        ? combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat)
        : logFormat,
    }),
    // Separate files for error vs combined — makes grepping production logs easy
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});