import { Sequelize } from 'sequelize';
import { ENV } from './env';
import { logger } from '../utils/logger';

export const sequelize = new Sequelize(
  ENV.DB.NAME,
  ENV.DB.USER,
  ENV.DB.PASSWORD,
  {
    host: ENV.DB.HOST,
    port: ENV.DB.PORT,
    dialect: 'postgres',

    // ── SSL config ────────────────────────────────────────────────────────────
    // Required for cloud Postgres providers (Neon, Supabase, RDS, etc.)
    // rejectUnauthorized: false — trusts the server's self-signed cert.
    // In production with a proper CA cert, set this to true and pass the CA.
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    // ─────────────────────────────────────────────────────────────────────────

    logging: ENV.IS_DEVELOPMENT
      ? (sql: string) => logger.debug(sql)
      : false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
      freezeTableName: false,
      timestamps: true,
    },
  }
);

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}