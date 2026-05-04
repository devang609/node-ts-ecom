import { sequelize } from '../config/database';
import { User } from './user.model';
import { logger } from '../utils/logger';

// Export all models from one place.
// Controllers and services import from here, never from individual model files.
// This makes future association setup (hasMany, belongsTo, etc.) a single location change.
export { User };

export async function syncDatabase(): Promise<void> {
  // alter: true — updates existing table columns without dropping data.
  // Never use force: true in production (drops and recreates tables).
  const options = { alter: process.env.NODE_ENV !== 'production' };

  await sequelize.sync(options);
  logger.info(`Database synced [alter: ${options.alter}]`);
}