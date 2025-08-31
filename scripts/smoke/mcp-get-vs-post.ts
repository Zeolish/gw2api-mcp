import { startServer } from '../../apps/server/src/index';
import { request } from 'undici';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

(async () => {
  const srv = startServer();
  await srv.start();
  const logs: string[] = [];
  try {
    const getRes = await request('http://127.0.0.1:5123/mcp', { method: 'GET' });
    const getBody = await getRes.body.text();
    logs.push(`GET /mcp -> ${getRes.statusCode} ${getRes.headers['content-type']} ${getBody}`);
    if (getRes.statusCode !== 405 || !String(getRes.headers['content-type']).includes('application/json')) {
      throw new Error('GET /mcp expected 405 application/json');
    }

    const postPayload = { id: '1', method: 'gw2.getStatus' };
    const postRes = await request('http://127.0.0.1:5123/mcp', {
      method: 'POST',
      body: JSON.stringify(postPayload),
      headers: { 'content-type': 'application/json' },
    });
    const postBodyText = await postRes.body.text();
    logs.push(`POST /mcp -> ${postRes.statusCode} ${postRes.headers['content-type']} ${postBodyText}`);
    const postBody = JSON.parse(postBodyText);
    if (postRes.statusCode !== 200 || postBody.error) {
      throw new Error('POST /mcp failed');
    }
  } finally {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const logPath = path.resolve(__dirname, '..', '..', 'diagnostics', 'mcp-get-vs-post.log');
    mkdirSync(path.dirname(logPath), { recursive: true });
    writeFileSync(logPath, logs.join('\n'), 'utf8');
    await srv.stop();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
