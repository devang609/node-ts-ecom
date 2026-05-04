import { DataTypes } from 'sequelize';

import type { Migration } from '../umzug.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(320),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('BUYER', 'SELLER', 'ADMIN'),
      allowNull: false,
      defaultValue: 'BUYER'
    },
    valid_after: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(0)
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
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('users');
};

