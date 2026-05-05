import request from 'supertest';

import { createApp } from '../../src/app.js';
import { createUser } from '../../src/services/user.service.js';
import { createProduct } from '../../src/services/product.service.js';
import { setupTestDb } from '../utils/setupTestDb.js';

setupTestDb();

describe('Cart', () => {
  it('rejects unauthenticated requests', async () => {
    const app = createApp();

    const res = await request(app).get('/cart').send();

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('code', 401);
  });

  it('rejects non-buyer role', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await createUser({ email: 'seller@example.com', password: 'password123', role: 'SELLER' });
    await agent.post('/auth/login').send({ email: 'seller@example.com', password: 'password123' }).expect(200);

    const res = await agent.get('/cart').send();
    expect(res.status).toBe(403);
  });

  it('upserts quantities and returns items with product fields', async () => {
    const app = createApp();
    const buyer = request.agent(app);

    const seller = await createUser({ email: 'seller@example.com', password: 'password123', role: 'SELLER' });
    await createUser({ email: 'buyer@example.com', password: 'password123', role: 'BUYER' });

    await buyer.post('/auth/login').send({ email: 'buyer@example.com', password: 'password123' }).expect(200);

    const product = await createProduct({
      actorUserId: seller.id,
      actorRole: 'SELLER',
      name: 'Book',
      category: 'Books',
      priceCents: 500,
      stockQuantity: 12
    });

    await buyer
      .post('/cart')
      .send({ items: [{ productId: product.id, quantity: 2 }] })
      .expect(200);

    await buyer
      .post('/cart')
      .send({ items: [{ productId: product.id, quantity: 5 }] })
      .expect(200);

    const res = await buyer.get('/cart').send();
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(5);
    expect(res.body.items[0].product.name).toBe('Book');
  });
});

