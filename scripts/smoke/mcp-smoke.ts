import { startServer } from '../../apps/server/src/index';
import { request } from 'undici';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

async function call(method: string, params: any) {
  const body = { id: method, method, params };
  const res = await request('http://127.0.0.1:5123/mcp', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
  const text = await res.body.text();
  return { status: res.statusCode, headers: res.headers, body: text };
}

(async () => {
  const srv = startServer();
  await srv.start();
  const logs: string[] = [];
  try {
    const tests = [
      ['gw2.getStatus', {}],
      ['gw2.setApiKey', { key: 'FAKE-KEY-FOR-TESTING' }],
      ['gw2.items.get', { ids: [19721] }],
    ] as const;
    for (const [method, params] of tests) {
      const res = await call(method, params);
      logs.push(`REQUEST ${method} => ${JSON.stringify(params)}`);
      logs.push(`RESPONSE ${res.status} ${JSON.stringify(res.headers)} ${res.body}`);
      const json = JSON.parse(res.body);
      if (res.status !== 200 || json.error || json.result === undefined) {
        throw new Error(`Call failed for ${method}`);
      }
    }
  } finally {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const logPath = path.resolve(__dirname, '..', '..', 'diagnostics', 'mcp-smoke.log');
    mkdirSync(path.dirname(logPath), { recursive: true });
    writeFileSync(logPath, logs.join('\n'), 'utf8');
    await srv.stop();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
