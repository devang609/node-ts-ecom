import { Sequelize } from 'sequelize';

import { newDb } from 'pg-mem';

import { config } from '../config/config.js';

function buildTestSequelize(): Sequelize {
  const memDb = newDb({ autoCreateForeignKeyIndices: true });
  const dialectModule = memDb.adapters.createPg();

  return new Sequelize('postgres://test:test@localhost:5432/test', {
    dialect: 'postgres',
    dialectModule,
    logging: false
  });
}

function buildPostgresSequelize(): Sequelize {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  return new Sequelize(config.databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: config.dbSsl
      ? {
          ssl: {
            rejectUnauthorized: false
          }
        }
      : undefined
  });
}

export const sequelize = config.env === 'test' ? buildTestSequelize() : buildPostgresSequelize();

