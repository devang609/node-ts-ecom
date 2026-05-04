import { sequelize } from './sequelize.js';

import { initModels } from '../models/index.js';
import { config } from '../config/config.js';

let initialized = false;

export async function initDb() {
  if (initialized) {
    return;
  }

  initModels(sequelize);
  await sequelize.authenticate();

  if (config.env === 'test') {
    await sequelize.sync({ force: true });
  }

  initialized = true;
}

export async function closeDb() {
  if (!initialized) {
    return;
  }

  await sequelize.close();
  initialized = false;
}
