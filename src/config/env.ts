import dotenv from 'dotenv';

dotenv.config();

type DurationString = `${number}${'m' | 'h' | 'd'}`;

function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function requireEnvInt(key: string): number {
  const value = requireEnv(key);
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be an integer, got: "${value}"`);
  }

  return parsed;
}

function requireEnvEnum<T extends readonly string[]>(
  key: string,
  allowedValues: T
): T[number] {
  const value = requireEnv(key);

  if (!allowedValues.includes(value)) {
    throw new Error(
      `Environment variable ${key} must be one of: ${allowedValues.join(', ')}. Got: "${value}"`
    );
  }

  return value as T[number];
}

function requireEnvDuration(key: string): DurationString {
  const value = requireEnv(key);

  if (!/^\d+(ms|s|m|h|d|w|y)$/.test(value)) {
    throw new Error(
      `Environment variable ${key} must be a valid duration, e.g. "15m", "1h", or "7d". Got: "${value}"`
    );
  }

  return value as DurationString;
}

const NODE_ENV_VALUES = ['development', 'production', 'test'] as const;

export const ENV = {
  NODE_ENV: requireEnvEnum('NODE_ENV', NODE_ENV_VALUES),
  PORT: requireEnvInt('PORT'),

  DB: {
    HOST: requireEnv('DB_HOST'),
    PORT: requireEnvInt('DB_PORT'),
    NAME: requireEnv('DB_NAME'),
    USER: requireEnv('DB_USER'),
    PASSWORD: requireEnv('DB_PASSWORD'),
  },

  JWT: {
    PRIVATE_KEY: requireEnv('JWT_PRIVATE_KEY').replace(/\\n/g, '\n'),
    PUBLIC_KEY: requireEnv('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
    ACCESS_TOKEN_EXPIRY: requireEnvDuration('JWT_ACCESS_TOKEN_EXPIRY'),
    REFRESH_TOKEN_EXPIRY: requireEnvDuration('JWT_REFRESH_TOKEN_EXPIRY'),
    ISSUER: requireEnv('JWT_ISSUER'),
    AUDIENCE: requireEnv('JWT_AUDIENCE'),
  },

  COOKIE_SECRET: requireEnv('COOKIE_SECRET'),

  RATE_LIMIT: {
    WINDOW_MS: requireEnvInt('RATE_LIMIT_WINDOW_MS'),
    MAX_REQUESTS: requireEnvInt('RATE_LIMIT_MAX_REQUESTS'),
  },

  get IS_PRODUCTION(): boolean {
    return this.NODE_ENV === 'production';
  },

  get IS_DEVELOPMENT(): boolean {
    return this.NODE_ENV === 'development';
  },
} as const;