import request from 'supertest';

import { createApp } from '../../src/app.js';
import { setupTestDb } from '../utils/setupTestDb.js';

setupTestDb();

describe('Auth', () => {
  describe('POST /auth/register', () => {
    it('registers a BUYER and sets cookies', async () => {
      const app = createApp();

      const response = await request(app).post('/auth/register').send({
        email: 'buyer@example.com',
        password: 'password123'
      });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('BUYER');
      expect(typeof response.body.userId).toBe('string');
      expect(Array.isArray(response.headers['set-cookie'])).toBe(true);
    });

    it('rejects invalid payload', async () => {
      const app = createApp();

      const response = await request(app).post('/auth/register').send({
        email: 'not-an-email'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 400);
    });
  });

  describe('POST /auth/login', () => {
    it('logs in with correct credentials', async () => {
      const app = createApp();

      await request(app).post('/auth/register').send({
        email: 'buyer@example.com',
        password: 'password123'
      });

      const response = await request(app).post('/auth/login').send({
        email: 'buyer@example.com',
        password: 'password123'
      });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('BUYER');
      expect(Array.isArray(response.headers['set-cookie'])).toBe(true);
    });

    it('rejects wrong password', async () => {
      const app = createApp();

      await request(app).post('/auth/register').send({
        email: 'buyer@example.com',
        password: 'password123'
      });

      const response = await request(app).post('/auth/login').send({
        email: 'buyer@example.com',
        password: 'wrongpassword'
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code', 401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('rotates refresh token and returns a new access token', async () => {
      const app = createApp();
      const agent = request.agent(app);

      await agent.post('/auth/register').send({
        email: 'buyer@example.com',
        password: 'password123'
      });

      const response = await agent.post('/auth/refresh').send();

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('BUYER');
      expect(Array.isArray(response.headers['set-cookie'])).toBe(true);
    });

    it('rejects when refresh_token cookie is missing', async () => {
      const app = createApp();

      const response = await request(app).post('/auth/refresh').send();

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code', 401);
    });
  });

  describe('POST /auth/logout', () => {
    it('logs out (all devices) and clears cookies', async () => {
      const app = createApp();
      const agent = request.agent(app);

      await agent.post('/auth/register').send({
        email: 'buyer@example.com',
        password: 'password123'
      });

      const response = await agent.post('/auth/logout').send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
      expect(Array.isArray(response.headers['set-cookie'])).toBe(true);
    });

    it('rejects when access_token cookie is missing', async () => {
      const app = createApp();

      const response = await request(app).post('/auth/logout').send();

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code', 401);
    });
  });
});
