import { DataTypes } from 'sequelize';

import type { Migration } from '../umzug.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('cart_items', {
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
      onDelete: 'CASCADE'
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    quantity: {
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

  await queryInterface.addConstraint('cart_items', {
    type: 'unique',
    name: 'cart_items_user_product_unique',
    fields: ['user_id', 'product_id']
  });

  await queryInterface.addIndex('cart_items', ['user_id']);
  await queryInterface.addIndex('cart_items', ['product_id']);
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('cart_items');
};

