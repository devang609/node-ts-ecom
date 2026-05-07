import { sequelize } from './sequelize.js';
import { umzug } from './umzug.js';
import { config } from '../config/config.js';

if (config.env === 'test') {
  throw new Error('Migrations are not supported in test environment (pg-mem). Use sequelize.sync({ force: true }).');
}

await sequelize.authenticate();

const direction = process.argv[2] === 'down' ? 'down' : 'up';

if (direction === 'down') {
  await umzug.down({ to: 0 });
} else {
  await umzug.up();
}

await sequelize.close();
