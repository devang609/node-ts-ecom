import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),
  SWAGGER_ENABLED: Joi.boolean().truthy('true').falsy('false').default(true),

  DATABASE_URL: Joi.when('NODE_ENV', {
    is: 'test',
    then: Joi.string().optional(),
    otherwise: Joi.string().uri({ scheme: [/^postgres(?:ql)?$/] }).required()
  }),
  DB_SSL: Joi.boolean().truthy('true').falsy('false').default(false),

  JWT_ISSUER: Joi.string().min(1).default('flipmart-auth'),
  JWT_AUDIENCE: Joi.string().min(1).default('flipmart'),
  JWT_PRIVATE_KEY_PATH: Joi.when('NODE_ENV', {
    is: 'test',
    then: Joi.string().optional(),
    otherwise: Joi.string().min(1).required()
  }),
  JWT_PUBLIC_KEY_PATH: Joi.when('NODE_ENV', {
    is: 'test',
    then: Joi.string().optional(),
    otherwise: Joi.string().min(1).required()
  }),

  ACCESS_TOKEN_TTL_MINUTES: Joi.number().integer().min(1).default(15),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().integer().min(1).default(7),

  COOKIE_SECURE: Joi.boolean().truthy('true').falsy('false').optional()
})
  .unknown()
  .required();

const { value: envVars, error } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV as 'development' | 'test' | 'production',
  port: envVars.PORT as number,
  logLevel: envVars.LOG_LEVEL as string,
  swaggerEnabled: envVars.SWAGGER_ENABLED as boolean,

  databaseUrl: envVars.DATABASE_URL as string | undefined,
  dbSsl: envVars.DB_SSL as boolean,

  jwtIssuer: envVars.JWT_ISSUER as string,
  jwtAudience: envVars.JWT_AUDIENCE as string,
  jwtPrivateKeyPath: envVars.JWT_PRIVATE_KEY_PATH as string | undefined,
  jwtPublicKeyPath: envVars.JWT_PUBLIC_KEY_PATH as string | undefined,

  accessTokenTtlMinutes: envVars.ACCESS_TOKEN_TTL_MINUTES as number,
  refreshTokenTtlDays: envVars.REFRESH_TOKEN_TTL_DAYS as number,

  cookieSecure:
    typeof envVars.COOKIE_SECURE === 'boolean' ? (envVars.COOKIE_SECURE as boolean) : envVars.NODE_ENV === 'production'
};
