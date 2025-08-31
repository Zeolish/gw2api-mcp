import { beforeAll, afterAll, test, expect } from 'vitest';
import { buildServer } from '../src/index';

let app: ReturnType<typeof buildServer>;

beforeAll(async () => {
  process.env.NODE_ENV = 'development';
  app = buildServer();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

test('GET /healthz -> 200 JSON', async () => {
  const res = await app.inject('/healthz');
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toContain('application/json');
});

test('GET /mcp -> 405 JSON', async () => {
  const res = await app.inject('/mcp');
  expect(res.statusCode).toBe(405);
  expect(res.headers['content-type']).toContain('application/json');
});

test('POST /mcp -> 200 JSON-RPC', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/mcp',
    payload: { id: '1', method: 'gw2.getStatus' },
  });
  expect(res.statusCode).toBe(200);
  const body = res.json();
  expect(body.result).toBeDefined();
  expect(body.error).toBeUndefined();
});

test('GET /docs -> 200 text/html', async () => {
  const res = await app.inject('/docs');
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toContain('text/html');
});

test('GET /ui/ -> 200 text/html', async () => {
  const res = await app.inject('/ui/');
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toContain('text/html');
});
