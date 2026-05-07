import winston from 'winston';
import fs from 'node:fs';
import path from 'node:path';

import { config } from './config.js';

const logsDir = path.join(process.cwd(), 'logs');
try {
  fs.mkdirSync(logsDir, { recursive: true });
} catch {
  // best-effort: if the dir cannot be created (permissions), file transports may fail
}

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    return { ...info, message: info.message, stack: info.stack };
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

const baseFormat = winston.format.combine(
  enumerateErrorFormat(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.timestamp()
);

const devFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info as Record<string, unknown>;
    const metaKeys = Object.keys(meta);
    const metaString = metaKeys.length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp as string} ${level as string}: ${message as string}${metaString}`;
  })
);

const jsonFormat = winston.format.combine(baseFormat, winston.format.json());

function buildConsoleTransport() {
  const level = config.env === 'test' ? 'error' : config.logLevel;
  return new winston.transports.Console({
    level,
    stderrLevels: ['error'],
    format: config.env === 'development' ? devFormat : jsonFormat
  });
}

export const logger = winston.createLogger({
  level: config.logLevel,
  defaultMeta: { env: config.env, service: 'flipmart' },
  format: config.env === 'development' ? devFormat : jsonFormat,
  transports: [
    buildConsoleTransport(),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: jsonFormat
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      level: config.logLevel,
      format: jsonFormat
    })
  ],
  exceptionHandlers: [
    buildConsoleTransport(),
    new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log'), format: jsonFormat })
  ],
  rejectionHandlers: [
    buildConsoleTransport(),
    new winston.transports.File({ filename: path.join(logsDir, 'rejections.log'), format: jsonFormat })
  ]
});
