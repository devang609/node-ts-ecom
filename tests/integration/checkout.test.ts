import request from 'supertest';

import { createApp } from '../../src/app.js';
import { setupTestDb } from '../utils/setupTestDb.js';
import { createUser } from '../../src/services/user.service.js';
import { createProduct } from '../../src/services/product.service.js';
import { CartItem, Order, OrderItem, Product } from '../../src/models/index.js';

setupTestDb();

describe('Checkout', () => {
  it('rejects unauthenticated requests', async () => {
    const app = createApp();
    const res = await request(app).post('/buy').send({ items: [] });
    expect(res.status).toBe(401);
  });

  it('rejects non-buyer role', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await createUser({ email: 'seller@example.com', password: 'password123', role: 'SELLER' });
    await agent.post('/auth/login').send({ email: 'seller@example.com', password: 'password123' }).expect(200);

    const res = await agent.post('/buy').send({ items: [{ productId: '00000000-0000-4000-8000-000000000000', quantity: 1 }] });
    expect(res.status).toBe(403);
  });

  it('creates an order, snapshots price, decrements stock, and clears cart items', async () => {
    const app = createApp();
    const buyerAgent = request.agent(app);

    const seller = await createUser({ email: 'seller@example.com', password: 'password123', role: 'SELLER' });
    const buyer = await createUser({ email: 'buyer@example.com', password: 'password123', role: 'BUYER' });

    await buyerAgent.post('/auth/login').send({ email: 'buyer@example.com', password: 'password123' }).expect(200);

    const product = await createProduct({
      actorUserId: seller.id,
      actorRole: 'SELLER',
      name: 'Keyboard',
      category: 'Electronics',
      priceCents: 3000,
      stockQuantity: 5
    });

    await buyerAgent.post('/cart').send({ items: [{ productId: product.id, quantity: 2 }] }).expect(200);

    const res = await buyerAgent.post('/buy').send({ items: [{ productId: product.id, quantity: 2 }] }).expect(201);
    expect(typeof res.body.orderId).toBe('string');

    const orderCount = await Order.count({ where: { userId: buyer.id } });
    expect(orderCount).toBe(1);

    const orderItems = await OrderItem.findAll({ where: { orderId: res.body.orderId } });
    expect(orderItems).toHaveLength(1);
    expect(orderItems[0].unitPriceCents).toBe(3000);
    expect(orderItems[0].lineTotalCents).toBe(6000);

    const reloadedProduct = await Product.findByPk(product.id);
    expect(reloadedProduct?.stockQuantity).toBe(3);

    const cartCount = await CartItem.count({ where: { userId: buyer.id, productId: product.id } });
    expect(cartCount).toBe(0);
  });

  it('rejects insufficient stock with 409 and does not change stock', async () => {
    const app = createApp();
    const buyerAgent = request.agent(app);

    const seller = await createUser({ email: 'seller@example.com', password: 'password123', role: 'SELLER' });
    await createUser({ email: 'buyer@example.com', password: 'password123', role: 'BUYER' });

    await buyerAgent.post('/auth/login').send({ email: 'buyer@example.com', password: 'password123' }).expect(200);

    const product = await createProduct({
      actorUserId: seller.id,
      actorRole: 'SELLER',
      name: 'Mouse',
      category: 'Electronics',
      priceCents: 1500,
      stockQuantity: 1
    });

    const res = await buyerAgent.post('/buy').send({ items: [{ productId: product.id, quantity: 2 }] });
    expect(res.status).toBe(409);

    const reloadedProduct = await Product.findByPk(product.id);
    expect(reloadedProduct?.stockQuantity).toBe(1);
  });
});

