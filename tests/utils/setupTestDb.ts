import { sequelize } from '../../src/db/sequelize.js';
import { closeDb, initDb } from '../../src/db/init.js';

export function setupTestDb() {
  beforeAll(async () => {
    await initDb();
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true });
  });

  afterAll(async () => {
    await closeDb();
  });
}
