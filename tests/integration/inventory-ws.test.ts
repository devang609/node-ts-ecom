import http from 'node:http';

import request from 'supertest';
import WebSocket from 'ws';

import { createApp } from '../../src/app.js';
import { User } from '../../src/models/index.js';
import { setupTestDb } from '../utils/setupTestDb.js';
import { attachWsServer, closeWsServer } from '../../src/realtime/ws.js';

setupTestDb();

function waitForWsMessage(ws: WebSocket): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out waiting for websocket message')), 5_000);
    ws.once('message', (data) => {
      clearTimeout(timeout);
      resolve(JSON.parse(data.toString('utf8')));
    });
    ws.once('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

describe('Inventory WebSocket', () => {
  it('broadcasts inventory.created and inventory.updated when stock changes', async () => {
    const app = createApp();
    const server = http.createServer(app);
    attachWsServer(server);

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to bind server');
    }
    const port = address.port;

    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    await new Promise<void>((resolve, reject) => {
      ws.once('open', () => resolve());
      ws.once('error', (err) => reject(err));
    });

    const agent = request.agent(server);

    await request(app).post('/auth/register').send({
      email: 'seller@example.com',
      password: 'password123'
    });
    await User.update({ role: 'SELLER' }, { where: { email: 'seller@example.com' } });

    await agent.post('/auth/login').send({ email: 'seller@example.com', password: 'password123' }).expect(200);

    const createdRes = await agent
      .post('/product/seller')
      .send({ name: 'P1', category: 'C1', priceCents: 100, stockQuantity: 1 })
      .expect(201);

    const createdMsg = await waitForWsMessage(ws);
    expect(createdMsg.type).toBe('inventory.created');
    expect(createdMsg.productId).toBe(createdRes.body.id);
    expect(createdMsg.stockQuantity).toBe(1);
    expect(createdMsg.status).toBe('IN_STOCK');

    await agent.patch(`/product/seller/${createdRes.body.id}`).send({ stockQuantity: 0 }).expect(200);

    const updatedMsg = await waitForWsMessage(ws);
    expect(updatedMsg.type).toBe('inventory.updated');
    expect(updatedMsg.productId).toBe(createdRes.body.id);
    expect(updatedMsg.stockQuantity).toBe(0);
    expect(updatedMsg.status).toBe('OUT_OF_STOCK');

    ws.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeWsServer();
  });
});

