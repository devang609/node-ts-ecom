import Joi from "joi";

const schema = Joi.object({
  PORT: Joi.number().default(3000),

  PG_HOST: Joi.string().required(),
  PG_PORT: Joi.number().default(5432),
  PG_DB: Joi.string().required(),
  PG_USER: Joi.string().required(),
  PG_PASSWORD: Joi.string().required(),

  PG_SSLMODE: Joi.string().valid("require", "disable").optional(),

  JWT_SECRET: Joi.string().min(32).required(),
}).unknown();

const { value, error } = schema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (error) {
  throw new Error(
    "Env validation error:\n" +
      error.details.map((d) => d.message).join("\n")
  );
}

const rawHost: string = value.PG_HOST;
const host: string = rawHost.split("?")[0]!;

const hasInlineSsl: boolean = rawHost.includes("sslmode=require");
const ssl: boolean =
  hasInlineSsl || value.PG_SSLMODE === "require";

type Env = {
  port: number;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
  };
  jwt: {
    secret: string;
  };
};

export const env: Env = {
  port: value.PORT,

  db: {
    host,
    port: value.PG_PORT,
    name: value.PG_DB,
    user: value.PG_USER,
    password: value.PG_PASSWORD,
    ssl,
  },

  jwt: {
    secret: value.JWT_SECRET,
  },
};