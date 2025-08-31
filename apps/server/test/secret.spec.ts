import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.resetModules();
});

async function importSecret() {
  return await import('../src/gw2/secret');
}

test('key persistence flow', async () => {
  let secret = await importSecret();
  expect(await secret.hasApiKey()).toBe(false);
  await secret.setApiKey('TEST-KEY-123');
  expect(await secret.hasApiKey()).toBe(true);
  vi.resetModules();
  secret = await importSecret();
  expect(await secret.hasApiKey()).toBe(true);
  await secret.deleteApiKey();
  expect(await secret.hasApiKey()).toBe(false);
});
