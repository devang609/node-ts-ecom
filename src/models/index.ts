import type { Sequelize } from 'sequelize';

import { initUserModel, User } from './user.model.js';
import { initUserSessionModel, UserSession } from './userSession.model.js';
import { initProductModel, Product } from './product.model.js';
import { initCartItemModel, CartItem } from './cartItem.model.js';
import { initOrderModel, Order } from './order.model.js';
import { initOrderItemModel, OrderItem } from './orderItem.model.js';

export function initModels(sequelizeInstance: Sequelize) {
  initUserModel(sequelizeInstance);
  initUserSessionModel(sequelizeInstance);
  initProductModel(sequelizeInstance);
  initCartItemModel(sequelizeInstance);
  initOrderModel(sequelizeInstance);
  initOrderItemModel(sequelizeInstance);

  User.hasMany(UserSession, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
  UserSession.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });

  User.hasMany(Product, { foreignKey: { name: 'sellerId', allowNull: false }, onDelete: 'CASCADE' });
  Product.belongsTo(User, { foreignKey: { name: 'sellerId', allowNull: false }, as: 'seller', onDelete: 'CASCADE' });

  User.hasMany(CartItem, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
  CartItem.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
  Product.hasMany(CartItem, { foreignKey: { name: 'productId', allowNull: false }, onDelete: 'CASCADE' });
  CartItem.belongsTo(Product, { foreignKey: { name: 'productId', allowNull: false }, onDelete: 'CASCADE' });

  User.hasMany(Order, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'RESTRICT' });
  Order.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'RESTRICT' });
  Order.hasMany(OrderItem, { foreignKey: { name: 'orderId', allowNull: false }, onDelete: 'CASCADE' });
  OrderItem.belongsTo(Order, { foreignKey: { name: 'orderId', allowNull: false }, onDelete: 'CASCADE' });
  Product.hasMany(OrderItem, { foreignKey: { name: 'productId', allowNull: false }, onDelete: 'RESTRICT' });
  OrderItem.belongsTo(Product, { foreignKey: { name: 'productId', allowNull: false }, onDelete: 'RESTRICT' });
}

export { CartItem, Order, OrderItem, Product, User, UserSession };
