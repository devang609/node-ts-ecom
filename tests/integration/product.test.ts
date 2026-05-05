import request from 'supertest';

import { createApp } from '../../src/app.js';
import { createUser } from '../../src/services/user.service.js';
import { setupTestDb } from '../utils/setupTestDb.js';
import { describe, it } from 'node:test';

setupTestDb();

describe('Products', () => {
  describe('GET /product/all', () => {
    it('returns 200 without auth', async () => {
      const app = createApp();

      const res = await request(app).get('/product/all').send();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body).toHaveProperty('page', 1);
    });
  });

  describe('Seller product CRUD', () => {
    it('allows SELLER to create and list own products', async () => {
      const app = createApp();
      const agent = request.agent(app);

      await createUser({ email: 'seller@example.com', password: 'password123', role: 'SELLER' });

      await agent.post('/auth/login').send({ email: 'seller@example.com', password: 'password123' }).expect(200);

      const createRes = await agent.post('/product/seller').send({
        name: 'Phone',
        category: 'Electronics',
        brand: 'Acme',
        priceCents: 9999,
        stockQuantity: 3
      });

      expect(createRes.status).toBe(201);
      expect(createRes.body).toHaveProperty('id');
      expect(createRes.body).toHaveProperty('sellerId');

      const listRes = await agent.get('/product/seller').send();
      expect(listRes.status).toBe(200);
      expect(listRes.body.total).toBe(1);
      expect(listRes.body.items[0].name).toBe('Phone');
    });

    it('prevents a SELLER from updating someone else’s product', async () => {
      const app = createApp();
      const seller1 = request.agent(app);
      const seller2 = request.agent(app);

      await createUser({ email: 'seller1@example.com', password: 'password123', role: 'SELLER' });
      await createUser({ email: 'seller2@example.com', password: 'password123', role: 'SELLER' });

      await seller1.post('/auth/login').send({ email: 'seller1@example.com', password: 'password123' }).expect(200);
      await seller2.post('/auth/login').send({ email: 'seller2@example.com', password: 'password123' }).expect(200);

      const createRes = await seller1.post('/product/seller').send({
        name: 'Laptop',
        category: 'Electronics',
        priceCents: 12345,
        stockQuantity: 2
      });

      expect(createRes.status).toBe(201);
      const productId = createRes.body.id as string;

      const patchRes = await seller2.patch(`/product/seller/${productId}`).send({ stockQuantity: 9 });
      expect(patchRes.status).toBe(403);
      expect(patchRes.body).toHaveProperty('code', 403);
    });

    it('allows ADMIN to update and delete any seller product', async () => {
      const app = createApp();
      const seller = request.agent(app);
      const admin = request.agent(app);

      await createUser({ email: 'seller@example.com', password: 'password123', role: 'SELLER' });
      await createUser({ email: 'admin@example.com', password: 'password123', role: 'ADMIN' });

      await seller.post('/auth/login').send({ email: 'seller@example.com', password: 'password123' }).expect(200);
      await admin.post('/auth/login').send({ email: 'admin@example.com', password: 'password123' }).expect(200);

      const createRes = await seller.post('/product/seller').send({
        name: 'Shoes',
        category: 'Fashion',
        priceCents: 2500,
        stockQuantity: 10
      });
      expect(createRes.status).toBe(201);
      const productId = createRes.body.id as string;

      await admin.patch(`/product/seller/${productId}`).send({ stockQuantity: 7 }).expect(200);
      await admin.delete(`/product/seller/${productId}`).send().expect(200);
    });
  });
});

function expect(status: number) {
  throw new Error('Function not implemented.');
}

