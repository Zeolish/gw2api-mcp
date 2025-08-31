import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import { fetch } from 'undici';
import { JsonRpcRequest } from '@gw2-mcp/shared';

dotenv.config();

const app = Fastify();

app.register(swagger, {
  openapi: {
    info: { title: 'GW2 MCP', version: '0.0.0' }
  }
});
app.register(swaggerUi, { routePrefix: '/docs' });

app.post('/mcp', async (request) => {
  const body = request.body as JsonRpcRequest;
  if (body.method === 'ping') {
    return { jsonrpc: '2.0', result: 'pong', id: body.id ?? null };
  }
  return { jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id: body.id ?? null };
});

app.get('/api/status', async () => {
  const build = await gw2Fetch<{ id: number }>('/v2/build');
  return { ok: true, build: build.id };
});

async function gw2Fetch<T>(path: string, tries = 3): Promise<T> {
  const url = `https://api.guildwars2.com${path}`;
  let delay = 500;
  for (let i = 0; i < tries; i++) {
    const headers: Record<string, string> = {};
    if (process.env.GW2_API_KEY) {
      headers.Authorization = `Bearer ${process.env.GW2_API_KEY}`;
    }
    const res = await fetch(url, { headers });
    if (res.ok) {
      return (await res.json()) as T;
    }
    await new Promise((r) => setTimeout(r, delay));
    delay *= 2;
  }
  throw new Error('Failed to fetch ' + path);
}

app.listen({ port: 5123, host: '127.0.0.1' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
