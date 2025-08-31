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

async function rpc(method: string, params?: any) {
  const res = await app.inject({ method: 'POST', url: '/mcp', payload: { id: '1', method, params } });
  return { status: res.statusCode, body: res.json() as any };
}

test('POST /mcp returns JSON-RPC', async () => {
  const res = await app.inject({ method: 'POST', url: '/mcp', payload: { id: '1', method: 'gw2.getStatus' } });
  expect(res.statusCode).toBe(200);
  const body = res.json();
  expect(body).toHaveProperty('id', '1');
  expect(body.result ?? body.error).toBeDefined();
});

test('GET /mcp returns 405', async () => {
  const res = await app.inject({ method: 'GET', url: '/mcp' });
  expect(res.statusCode).toBe(405);
  expect(res.headers['content-type']).toMatch(/application\/json/);
});

test('gw2.getStatus', async () => {
  const { status, body } = await rpc('gw2.getStatus', {});
  expect(status).toBe(200);
  expect(body.result).toEqual(expect.objectContaining({ server: 'running', port: 5123 }));
});

test('unknown method', async () => {
  const { status, body } = await rpc('gw2.unknown');
  expect(status).toBe(200);
  expect(body.error).toEqual(expect.objectContaining({ code: -32601 }));
});

test('invalid params', async () => {
  const { status, body } = await rpc('gw2.setApiKey', {});
  expect(status).toBe(200);
  expect(body.error).toEqual(expect.objectContaining({ code: -32602 }));
});
