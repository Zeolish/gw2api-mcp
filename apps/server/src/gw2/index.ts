import { fetch } from 'undici';
import { getApiKey, setApiKey, deleteApiKey, hasApiKey, SERVICE, ACCOUNT } from './secret';

export { getApiKey, setApiKey, deleteApiKey, hasApiKey, SERVICE, ACCOUNT };

const BASE = 'https://api.guildwars2.com';

const TTL = 60_000; // 60 seconds
const cache = new Map<string, { expire: number; value: any }>();

function getCache(key: string) {
  const entry = cache.get(key);
  if (entry && entry.expire > Date.now()) {
    return entry.value;
  }
  cache.delete(key);
  return undefined;
}

function setCache(key: string, value: any) {
  cache.set(key, { expire: Date.now() + TTL, value });
}

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
    const path = `/v2/items?ids=${ids.join(',')}`;
    const cached = getCache(path);
    if (cached) return cached;
    const res = await request(path);
    setCache(path, res);
    return res;
  }
  async itemsSearchByName(name: string): Promise<unknown> {
    return request(`/v2/items/search?name=${encodeURIComponent(name)}`);
  }
  async recipesGet(ids: number[]): Promise<unknown> {
    const path = `/v2/recipes?ids=${ids.join(',')}`;
    const cached = getCache(path);
    if (cached) return cached;
    const res = await request(path);
    setCache(path, res);
    return res;
  }
  async recipesSearchByOutputItemId(id: number): Promise<unknown> {
    return request(`/v2/recipes/search?output=${id}`);
  }
  async pricesGet(ids: number[]): Promise<unknown> {
    const path = `/v2/commerce/prices?ids=${ids.join(',')}`;
    const cached = getCache(path);
    if (cached) return cached;
    const res = await request(path);
    setCache(path, res);
    return res;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const key = await getApiKey();
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
