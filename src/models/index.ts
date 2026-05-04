import type { Sequelize } from 'sequelize';

import { initUserModel, User } from './user.model.js';
import { initUserSessionModel, UserSession } from './userSession.model.js';

export function initModels(sequelizeInstance: Sequelize) {
  initUserModel(sequelizeInstance);
  initUserSessionModel(sequelizeInstance);

  User.hasMany(UserSession, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
  UserSession.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
}

export { User, UserSession };

