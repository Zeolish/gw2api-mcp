import { beforeAll, afterAll, test, expect } from 'vitest';
import { buildServer } from '../src/index';

let app: ReturnType<typeof buildServer>;

beforeAll(async () => {
  app = buildServer();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

test('GET /api/status returns ok', async () => {
  const res = await app.inject({ method: 'GET', url: '/api/status' });
  expect(res.statusCode).toBe(200);
  const body = res.json();
  expect(body).toHaveProperty('hasApiKey');
});
