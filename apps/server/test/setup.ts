import { vi } from 'vitest';

const store = new Map<string, string>();

vi.mock('keytar', () => ({
  default: {
    async getPassword(service: string, account: string) {
      return store.get(`${service}:${account}`) ?? null;
    },
    async setPassword(service: string, account: string, password: string) {
      store.set(`${service}:${account}`, password);
    },
    async deletePassword(service: string, account: string) {
      store.delete(`${service}:${account}`);
      return true;
    },
  },
}));
