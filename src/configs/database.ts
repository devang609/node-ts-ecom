import config from 'dotenv/config.js';
import { Sequelize } from 'sequelize';
import type { Options } from "sequelize";

const rawHost = process.env.PG_HOST ?? "";
const requiresSsl =
  rawHost.includes("sslmode=require") || process.env.PG_SSLMODE === "require";
const host = rawHost.split("?")[0] ?? rawHost;
const port = process.env.PG_PORT ? Number.parseInt(process.env.PG_PORT, 10) : undefined;

const sequelizeOptions: Options = {
  dialect: "postgres",
  host,
  database: process.env.PG_DB as string,
  username: process.env.PG_USER as string,
  password: process.env.PG_PASSWORD as string,
  logging: true,
  ...(port !== undefined && Number.isFinite(port) ? { port } : {}),
  ...(requiresSsl
    ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
    : {}),
};

const sequelize = new Sequelize(sequelizeOptions);

export default sequelize;
