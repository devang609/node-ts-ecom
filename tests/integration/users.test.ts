import request from 'supertest';

import { createApp } from '../../src/app.js';
import { User } from '../../src/models/index.js';
import { setupTestDb } from '../utils/setupTestDb.js';

setupTestDb();

async function createAdminAgent(app: ReturnType<typeof createApp>) {
  await request(app).post('/auth/register').send({
    email: 'admin@example.com',
    password: 'password123'
  });

  await User.update({ role: 'ADMIN' }, { where: { email: 'admin@example.com' } });

  const agent = request.agent(app);
  const login = await agent.post('/auth/login').send({
    email: 'admin@example.com',
    password: 'password123'
  });

  expect(login.status).toBe(200);
  expect(login.body.role).toBe('ADMIN');
  return agent;
}

describe('Users (ADMIN)', () => {
  it('lists users (including ADMIN) and forbids modifying ADMIN users', async () => {
    const app = createApp();
    const adminAgent = await createAdminAgent(app);

    const buyer = await request(app).post('/auth/register').send({
      email: 'buyer@example.com',
      password: 'password123'
    });
    expect(buyer.status).toBe(201);

    const list = await adminAgent.get('/users').send();
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(2);
    expect(Array.isArray(list.body.items)).toBe(true);
    expect(list.body.items.some((u: any) => u.email === 'admin@example.com' && u.role === 'ADMIN')).toBe(true);

    const adminUser = list.body.items.find((u: any) => u.email === 'admin@example.com');
    const patchAdmin = await adminAgent.patch(`/users/${adminUser.id}`).send({ role: 'SELLER' });
    expect(patchAdmin.status).toBe(403);
  });

  it('creates BUYER users only, supports BUYER<->SELLER role changes, and invalidates old tokens on role change', async () => {
    const app = createApp();
    const adminAgent = await createAdminAgent(app);

    const create = await adminAgent.post('/users').send({
      email: 'user1@example.com',
      password: 'password123'
    });
    expect(create.status).toBe(201);
    expect(create.body.role).toBe('BUYER');

    const buyerAgent = request.agent(app);
    const buyerLogin = await buyerAgent.post('/auth/login').send({
      email: 'user1@example.com',
      password: 'password123'
    });
    expect(buyerLogin.status).toBe(200);

    const promote = await adminAgent.patch(`/users/${create.body.id}`).send({ role: 'SELLER' });
    expect(promote.status).toBe(200);
    expect(promote.body.role).toBe('SELLER');

    const refreshAfterPromote = await buyerAgent.post('/auth/refresh').send();
    expect(refreshAfterPromote.status).toBe(401);

    const demote = await adminAgent.patch(`/users/${create.body.id}`).send({ role: 'BUYER' });
    expect(demote.status).toBe(200);
    expect(demote.body.role).toBe('BUYER');
  });

  it('hard-deletes non-admin users and returns 404 after deletion', async () => {
    const app = createApp();
    const adminAgent = await createAdminAgent(app);

    const created = await adminAgent.post('/users').send({
      email: 'user2@example.com',
      password: 'password123'
    });
    expect(created.status).toBe(201);

    const del = await adminAgent.delete(`/users/${created.body.id}`).send();
    expect(del.status).toBe(200);
    expect(del.body).toEqual({ ok: true });

    const get = await adminAgent.get(`/users/${created.body.id}`).send();
    expect(get.status).toBe(404);
  });
});

