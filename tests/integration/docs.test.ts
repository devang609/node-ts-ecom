import request from 'supertest';

import { createApp } from '../../src/app.js';

describe('GET /api/docs', () => {
  it('returns OpenAPI JSON spec', async () => {
    const app = createApp();

    const res = await request(app).get('/api/docs').send();

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toHaveProperty('openapi', '3.0.0');
    expect(res.body).toHaveProperty(['paths', '/health']);
  });
});

