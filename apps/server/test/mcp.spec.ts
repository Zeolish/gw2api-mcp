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

test('/debug/routes lists /mcp', async () => {
  const res = await app.inject({ method: 'GET', url: '/debug/routes' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toContain('mcp (POST)');
});
