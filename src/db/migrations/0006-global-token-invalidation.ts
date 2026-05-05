import type { Migration } from '../umzug.js';

export const up: Migration = async ({ context: queryInterface }) => {
  const now = new Date();

  await queryInterface.sequelize.query('UPDATE "users" SET "valid_after" = :now', {
    replacements: { now }
  });

  await queryInterface.sequelize.query('UPDATE "user_sessions" SET "revoked_at" = :now WHERE "revoked_at" IS NULL', {
    replacements: { now }
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  // Irreversible by design (one-time global invalidation)
  await queryInterface.sequelize.query('SELECT 1');
};
