import http from 'node:http';

import { config } from './config/config.js';
import { logger } from './config/logger.js';
import { createApp } from './app.js';
import { closeDb, initDb } from './db/init.js';
import { attachWsServer, closeWsServer } from './realtime/ws.js';

let isShuttingDown = false;
let server: http.Server | undefined;

async function shutdown(reason: string) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  logger.error('Shutting down server', { reason });

  try {
    await closeDb();
  } catch (err) {
    logger.error('Failed to close DB', { error: err });
  }

  try {
    closeWsServer();
  } catch (err) {
    logger.error('Failed to close WebSocket server', { error: err });
  }

  if (server) {
    await new Promise<void>((resolve) => {
      server?.close(() => resolve());
    });
  }

  process.exit(1);
}

async function main() {
  process.on('uncaughtException', (err) => {
    void shutdown(`uncaughtException: ${err.message}`);
  });

  process.on('unhandledRejection', (reason) => {
    void shutdown(`unhandledRejection: ${String(reason)}`);
  });

  await initDb();

  const app = createApp();
  server = http.createServer(app);
  attachWsServer(server);

  server.listen(config.port, () => {
    logger.info('Server started', { port: config.port, env: config.env });
  });
}

main().catch((err) => {
  logger.error('Server failed to start', { error: err });
  process.exit(1);
});
