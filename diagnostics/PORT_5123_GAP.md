# Port 5123 GAP Report

## Original Port Owner
Before fixes, the Electron renderer dev server from `electron-vite` occupied port **5123**, serving the SPA and intercepting `/mcp` and `/docs`.

## Catch-all Source
The renderer dev server acted as a catch-all on port 5123, causing requests like `GET /mcp` to hit the SPA instead of Fastify.

## Code Changes
- `apps/desktop/electron.vite.config.ts` – set renderer dev server to port 5173.
- `apps/server/src/index.ts` – added `onSend` hook for `x-gw2mcp` header.
- `scripts/smoke/port-ownership.ts` – smoke test verifying port and endpoints.
- `package.json` – added `smoke:port` script.
- `apps/server/test/routes.spec.ts` – Vitest coverage for key routes.

## How to Run
```
pnpm -C apps/server dev
curl -i http://127.0.0.1:5123/healthz
curl -i http://127.0.0.1:5123/mcp
curl -i http://127.0.0.1:5123/docs
curl -i http://127.0.0.1:5123/ui/
```
