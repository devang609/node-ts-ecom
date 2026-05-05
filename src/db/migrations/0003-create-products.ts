import { DataTypes } from 'sequelize';

import type { Migration } from '../umzug.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('products', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    price_cents: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  await queryInterface.addIndex('products', ['seller_id']);
  await queryInterface.addIndex('products', ['category']);
  await queryInterface.addIndex('products', ['brand']);
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('products');
};

