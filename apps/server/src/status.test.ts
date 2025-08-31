import { beforeAll, afterAll, it, expect } from 'vitest';
import { startServer } from './index';
import { fetch } from 'undici';

let srv: ReturnType<typeof startServer>;

beforeAll(async () => {
  srv = startServer();
  await srv.start();
});

afterAll(async () => {
  await srv.stop();
});

it('GET /api/status returns JSON shape', async () => {
  const res = await fetch('http://127.0.0.1:5123/api/status');
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('hasApiKey');
  expect(body).toHaveProperty('server');
  expect(body).toHaveProperty('port');
});
