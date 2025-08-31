import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  McpRequest,
  McpResponse,
  ToolNames,
  StatusResponse,
} from '@gw2-mcp/shared';
import {
  Gw2Public,
  Gw2Account,
  hasApiKey,
  setApiKey,
  deleteApiKey,
} from './gw2';

const PORT = 5123;
const HOST = '127.0.0.1';

function maskKey(key: string): string {
  if (key.length <= 4) {
    return '*'.repeat(key.length);
  }
  return `${key.slice(0, 2)}...${key.slice(-2)}`;
}

export function buildServer() {
  const app = Fastify({ logger: true });

  // reject non-loopback
  app.addHook('onRequest', (req, reply, done) => {
    const ip = req.ip;
    if (ip !== '127.0.0.1' && ip !== '::1' && ip !== '::ffff:127.0.0.1') {
      reply.code(403).send({ error: 'Forbidden' });
      return;
    }
    done();
  });

  app.register(swagger, {
    openapi: {
      info: { title: 'GW2 MCP Local Debug', version: '0.0.0' },
    },
  });
  app.register(swaggerUi, { routePrefix: '/docs' });

  const pub = new Gw2Public();
  const acct = new Gw2Account();

  const methods: Record<string, (params?: any) => Promise<any>> = {
    [ToolNames.GetStatus]: async () => {
      const hasKey = await hasApiKey();
      const res: StatusResponse = { hasApiKey: hasKey, server: 'running', port: PORT };
      return res;
    },
    [ToolNames.SetApiKey]: async (p: { key: string }) => {
      app.log.info({ key: maskKey(p.key) }, 'GW2 API key set');
      await setApiKey(p.key);
      return { ok: true };
    },
    [ToolNames.DeleteApiKey]: async () => {
      await deleteApiKey();
      return { ok: true };
    },
    [ToolNames.ItemsGet]: async (p: { ids: number[] }) => pub.itemsGet(p.ids),
    [ToolNames.ItemsSearchByName]: async (p: { name: string }) => pub.itemsSearchByName(p.name),
    [ToolNames.RecipesGet]: async (p: { ids: number[] }) => pub.recipesGet(p.ids),
    [ToolNames.RecipesSearchByOutputItemId]: async (p: { id: number }) => pub.recipesSearchByOutputItemId(p.id),
    [ToolNames.PricesGet]: async (p: { ids: number[] }) => pub.pricesGet(p.ids),
    [ToolNames.AccountMaterials]: async () => acct.materials(),
    [ToolNames.AccountBank]: async () => acct.bank(),
    [ToolNames.AccountCharacters]: async () => acct.characters(),
    [ToolNames.AccountWallet]: async () => acct.wallet(),
  };

  app.post('/mcp', async (request): Promise<McpResponse> => {
    const body = request.body as McpRequest;
    const fn = methods[body.method];
    if (!fn) {
      return { id: body.id, error: { code: -32601, message: 'Method not found' } };
    }
    try {
      const result = await fn(body.params as any);
      return { id: body.id, result };
    } catch (err: any) {
      return { id: body.id, error: { code: -32000, message: err.message } };
    }
  });

  // REST shims
  app.get('/api/status', async () => methods[ToolNames.GetStatus]());
  app.post('/api/settings/gw2key', async (req) => {
    const body = req.body as { key: string };
    return methods[ToolNames.SetApiKey](body);
  });
  app.delete('/api/settings/gw2key', async () => methods[ToolNames.DeleteApiKey]());
  app.get('/api/items', async (req) => {
    const ids = String((req.query as any).ids || '')
      .split(',')
      .filter(Boolean)
      .map((s) => Number(s));
    return methods[ToolNames.ItemsGet]({ ids });
  });
  app.get('/api/items/search', async (req) => {
    const name = String((req.query as any).name || '');
    return methods[ToolNames.ItemsSearchByName]({ name });
  });
  app.get('/api/recipes', async (req) => {
    const ids = String((req.query as any).ids || '')
      .split(',')
      .filter(Boolean)
      .map((s) => Number(s));
    return methods[ToolNames.RecipesGet]({ ids });
  });
  app.get('/api/recipes/by-output', async (req) => {
    const id = Number((req.query as any).id);
    return methods[ToolNames.RecipesSearchByOutputItemId]({ id });
  });
  app.post('/api/prices', async (req) => {
    const body = req.body as { ids: number[] };
    return methods[ToolNames.PricesGet](body);
  });
  app.get('/api/account/materials', async () => methods[ToolNames.AccountMaterials]());
  app.get('/api/account/bank', async () => methods[ToolNames.AccountBank]());
  app.get('/api/account/characters', async () => methods[ToolNames.AccountCharacters]());
  app.get('/api/account/wallet', async () => methods[ToolNames.AccountWallet]());

  return app;
}

export function startServer() {
  const app = buildServer();
  return {
    start: () => app.listen({ port: PORT, host: HOST }),
    stop: () => app.close(),
  };
}

if (require.main === module) {
  const s = startServer();
  s.start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
