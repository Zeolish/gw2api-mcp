import { expect, test, beforeAll, afterAll, vi } from 'vitest';
import { buildServer } from '../src/index';

let app: ReturnType<typeof buildServer>;

beforeAll(async () => {
  app = buildServer();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

test('status reflects key presence', async () => {
  let res = await app.inject({ method: 'GET', url: '/api/status' });
  expect(res.json().hasApiKey).toBe(false);
  await app.inject({
    method: 'POST',
    url: '/api/settings/gw2key',
    payload: { key: 'TEST-KEY-123' },
  });
  res = await app.inject({ method: 'GET', url: '/api/status' });
  expect(res.json().hasApiKey).toBe(true);
  await app.inject({ method: 'DELETE', url: '/api/settings/gw2key' });
  res = await app.inject({ method: 'GET', url: '/api/status' });
  expect(res.json().hasApiKey).toBe(false);
});
