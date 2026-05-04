import dotenv from 'dotenv';

dotenv.config();

// Fail fast on startup if any required env var is missing.
// This prevents subtle runtime errors caused by undefined configs.
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function requireEnvInt(key: string): number {
  const value = requireEnv(key);
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be an integer, got: "${value}"`);
  }
  return parsed;
}

export const ENV = {
  NODE_ENV: requireEnv('NODE_ENV') as 'development' | 'production' | 'test',
  PORT: requireEnvInt('PORT'),

  DB: {
    HOST: requireEnv('DB_HOST'),
    PORT: requireEnvInt('DB_PORT'),
    NAME: requireEnv('DB_NAME'),
    USER: requireEnv('DB_USER'),
    PASSWORD: requireEnv('DB_PASSWORD'),
  },

  JWT: {
    // Restore actual newlines from the single-line env format
    PRIVATE_KEY: requireEnv('JWT_PRIVATE_KEY').replace(/\\n/g, '\n'),
    PUBLIC_KEY: requireEnv('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
    ACCESS_TOKEN_EXPIRY: requireEnv('JWT_ACCESS_TOKEN_EXPIRY'),
    REFRESH_TOKEN_EXPIRY: requireEnv('JWT_REFRESH_TOKEN_EXPIRY'),
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
