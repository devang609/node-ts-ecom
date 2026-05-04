import { DataTypes } from 'sequelize';

import type { Migration } from '../umzug.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('user_sessions', {
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
    refresh_token_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true
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
  await queryInterface.dropTable('user_sessions');
};

