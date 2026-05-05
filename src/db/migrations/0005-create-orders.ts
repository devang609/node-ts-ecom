import { DataTypes } from 'sequelize';

import type { Migration } from '../umzug.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('orders', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'RESTRICT'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    total_cents: {
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

  await queryInterface.createTable('order_items', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'RESTRICT'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unit_price_cents: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    line_total_cents: {
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

  await queryInterface.addIndex('orders', ['user_id']);
  await queryInterface.addIndex('order_items', ['order_id']);
  await queryInterface.addIndex('order_items', ['product_id']);
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('order_items');
  await queryInterface.dropTable('orders');
};

