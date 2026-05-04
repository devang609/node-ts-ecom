import { sequelize } from './sequelize.js';
import { umzug } from './umzug.js';

await sequelize.authenticate();

const direction = process.argv[2] === 'down' ? 'down' : 'up';

if (direction === 'down') {
  await umzug.down({ to: 0 });
} else {
  await umzug.up();
}

await sequelize.close();

