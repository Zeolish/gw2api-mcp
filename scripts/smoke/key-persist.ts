import { request } from 'undici';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function postKey(key: string) {
  await request('http://127.0.0.1:5123/api/settings/gw2key', {
    method: 'POST',
    body: JSON.stringify({ key }),
    headers: { 'content-type': 'application/json' },
  });
}

async function getStatus() {
  const res = await request('http://127.0.0.1:5123/api/status');
  const data = await res.body.json();
  return data.hasApiKey as boolean;
}

async function deleteKey() {
  await request('http://127.0.0.1:5123/api/settings/gw2key', { method: 'DELETE' });
}

(async () => {
  await postKey('FAKE-PERSIST-KEY');
  let present = await getStatus();
  if (!present) throw new Error('Key not set');
  console.log('Key set; please restart the server then press enter...');
  const rl = readline.createInterface({ input, output });
  await rl.question('');
  present = await getStatus();
  if (!present) throw new Error('Key missing after restart');
  await deleteKey();
  present = await getStatus();
  if (present) throw new Error('Key still present after delete');
  console.log('Key persistence smoke test passed');
  rl.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
