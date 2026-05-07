import type http from 'node:http';

import WebSocket, { WebSocketServer } from 'ws';

import { logger } from '../config/logger.js';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

let wss: WebSocketServer | undefined;
let clients: Set<WebSocket> | undefined;

export function attachWsServer(server: http.Server): void {
  if (wss) {
    return;
  }

  clients = new Set<WebSocket>();
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket) => {
    clients?.add(socket);

    socket.on('close', () => {
      clients?.delete(socket);
    });

    socket.on('error', (err) => {
      logger.warn('WebSocket client error', { error: err });
      clients?.delete(socket);
    });
  });

  wss.on('error', (err) => {
    logger.error('WebSocket server error', { error: err });
  });

  logger.info('WebSocket server attached', { path: '/ws' });
}

export function closeWsServer(): void {
  if (!wss) return;
  try {
    wss.close();
  } catch (err) {
    logger.warn('Failed to close WebSocket server', { error: err });
  }
  wss = undefined;
  clients?.clear();
  clients = undefined;
}

export function broadcastJson(message: JsonValue): void {
  if (!clients || clients.size === 0) return;

  let payload: string;
  try {
    payload = JSON.stringify(message);
  } catch (err) {
    logger.warn('Failed to serialize WebSocket message', { error: err });
    return;
  }

  for (const socket of clients) {
    if (socket.readyState !== WebSocket.OPEN) continue;
    socket.send(payload, (err) => {
      if (err) {
        logger.warn('WebSocket send failed', { error: err });
      }
    });
  }
}

