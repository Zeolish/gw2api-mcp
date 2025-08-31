import { fetch } from 'undici';

let keytar: typeof import('keytar');
try {
  keytar = require('keytar');
} catch {
  const store = new Map<string, string>();
  keytar = {
    async getPassword(service: string, account: string) {
      return store.get(`${service}:${account}`) ?? null;
    },
    async setPassword(service: string, account: string, password: string) {
      store.set(`${service}:${account}`, password);
      return true;
    },
    async deletePassword(service: string, account: string) {
      return store.delete(`${service}:${account}`);
    },
  } as any;
}

const BASE = 'https://api.guildwars2.com';

async function request<T>(path: string, headers: Record<string, string> = {}, tries = 3): Promise<T> {
  const url = `${BASE}${path}`;
  let delay = 500;
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers });
    if (res.ok) {
      return (await res.json()) as T;
    }
    await new Promise((r) => setTimeout(r, delay));
    delay *= 2;
  }
  throw new Error(`Failed to fetch ${path}`);
}

export class Gw2Public {
  async itemsGet(ids: number[]): Promise<unknown> {
    return request(`/v2/items?ids=${ids.join(',')}`);
  }
  async itemsSearchByName(name: string): Promise<unknown> {
    return request(`/v2/items/search?name=${encodeURIComponent(name)}`);
  }
  async recipesGet(ids: number[]): Promise<unknown> {
    return request(`/v2/recipes?ids=${ids.join(',')}`);
  }
  async recipesSearchByOutputItemId(id: number): Promise<unknown> {
    return request(`/v2/recipes/search?output=${id}`);
  }
  async pricesGet(ids: number[]): Promise<unknown> {
    return request(`/v2/commerce/prices?ids=${ids.join(',')}`);
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const key = await keytar.getPassword('gw2-mcp', 'api-key');
  if (!key) {
    throw new Error('GW2 API key not set');
  }
  return { Authorization: `Bearer ${key}` };
}

export class Gw2Account {
  async materials(): Promise<unknown> {
    return request('/v2/account/materials', await authHeaders());
  }
  async bank(): Promise<unknown> {
    return request('/v2/account/bank', await authHeaders());
  }
  async characters(): Promise<unknown> {
    return request('/v2/characters', await authHeaders());
  }
  async wallet(): Promise<unknown> {
    return request('/v2/account/wallet', await authHeaders());
  }
}

export async function hasApiKey(): Promise<boolean> {
  const key = await keytar.getPassword('gw2-mcp', 'api-key');
  return !!key;
}

export async function setApiKey(key: string): Promise<void> {
  await keytar.setPassword('gw2-mcp', 'api-key', key);
}

export async function deleteApiKey(): Promise<void> {
  await keytar.deletePassword('gw2-mcp', 'api-key');
}
