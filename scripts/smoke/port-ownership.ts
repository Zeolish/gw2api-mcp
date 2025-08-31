import fs from 'fs';

function portOwner(port: number): string {
  const portHex = port.toString(16).toUpperCase().padStart(4, '0');
  try {
    const lines = fs.readFileSync('/proc/net/tcp', 'utf8').split('\n').slice(1);
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 9 && parts[1].endsWith(`:${portHex}`)) {
        const inode = parts[9];
        const pids = fs.readdirSync('/proc').filter((p) => /^\d+$/.test(p));
        for (const pid of pids) {
          try {
            const fds = fs.readdirSync(`/proc/${pid}/fd`);
            for (const fd of fds) {
              const link = fs.readlinkSync(`/proc/${pid}/fd/${fd}`);
              if (link.includes(`socket:[${inode}]`)) {
                const cmd = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').replace(/\0/g, ' ').trim();
                return `${pid}:${cmd}`;
              }
            }
          } catch {
            // ignore permission errors
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return 'unknown';
}

async function probe(path: string) {
  const res = await fetch(`http://127.0.0.1:5123${path}`);
  const body = await res.text();
  console.log(`${path} -> ${res.status} ${res.headers.get('content-type') || ''} ${res.headers.get('x-gw2mcp') || ''}`);
  return body;
}

(async () => {
  console.log(`port 5123 owner: ${portOwner(5123)}`);
  await probe('/healthz');
  await probe('/mcp');
  await probe('/docs');
  await probe('/ui/');
})();
