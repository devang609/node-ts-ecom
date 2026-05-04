import app from './app';
import { connectDatabase } from './config/database';
import { ENV } from './config/env';
import { logger } from './utils/logger';
import { syncDatabase } from './models';

async function startServer(): Promise<void> {
  // Connect to DB before accepting any traffic
  await connectDatabase();
  await syncDatabase();

  const server = app.listen(ENV.PORT, () => {
    logger.info(`FlipMart server running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
  });

  // ── Graceful Shutdown ─────────────────────────────────────────────────────
  // Allows in-flight requests to complete before the process exits.
  // Prevents data corruption during deploys or crashes.
  const shutdown = (signal: string) => {
    logger.warn(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled promise rejections — prevent silent failures
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection:', reason);
    shutdown('unhandledRejection');
  });
}

startServer();