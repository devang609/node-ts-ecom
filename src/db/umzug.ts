import { Umzug, SequelizeStorage } from 'umzug';

import { logger } from '../config/logger.js';

import { sequelize } from './sequelize.js';

export type Migration = typeof umzug._types.migration;

const migrationsCwd = `${process.cwd()}/dist/db/migrations`;

export const umzug = new Umzug({
  migrations: { glob: ['*.js', { cwd: migrationsCwd }] },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: {
    info: (message) => logger.info('Migration', { message }),
    warn: (message) => logger.warn('Migration', { message }),
    error: (message) => logger.error('Migration', { message }),
    debug: (message) => logger.debug('Migration', { message })
  }
});

