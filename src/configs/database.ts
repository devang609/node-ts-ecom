import { Sequelize } from "sequelize";
import { env } from "./env.ts";

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  dialect: "postgres",
  host: env.db.host,
  port: env.db.port,
  logging: true,

  ...(env.db.ssl && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
});

export default sequelize;