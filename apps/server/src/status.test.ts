import { beforeAll, afterAll, it, expect } from 'vitest';
import { startServer, buildServer } from './index';
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

it('rejects non-loopback requests', async () => {
  const app = buildServer();
  const res = await app.inject({ method: 'GET', url: '/api/status', remoteAddress: '1.2.3.4' });
  expect(res.statusCode).toBe(403);
  await app.close();
});
