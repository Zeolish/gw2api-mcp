# GAP REPORT

## Spec vs Implementation

| MCP Method | REST Shim | Implemented |
|------------|-----------|-------------|
| gw2.getStatus | GET /api/status | ✅ |
| gw2.setApiKey | POST /api/settings/gw2key | ✅ |
| gw2.deleteApiKey | DELETE /api/settings/gw2key | ✅ |
| gw2.items.get | GET /api/items | ✅ |
| gw2.items.searchByName | GET /api/items/search | ✅ |
| gw2.recipes.get | GET /api/recipes | ✅ |
| gw2.recipes.searchByOutputItemId | GET /api/recipes/by-output | ✅ |
| gw2.prices.get | POST /api/prices | ✅ |
| gw2.account.getMaterials | GET /api/account/materials | ✅ |
| gw2.account.getBank | GET /api/account/bank | ✅ |
| gw2.account.getCharacters | GET /api/account/characters | ✅ |
| gw2.account.getWallet | GET /api/account/wallet | ✅ |

## Root Cause for /mcp Failure
Requests with `Content-Type: application/json-rpc` were not parsed, leading Fastify to return 415 errors. A custom content type parser now accepts this type and dispatches JSON-RPC calls correctly.

## Files Changed
- `apps/server/src/index.ts` – added logging redaction, content type parser, schema validation, debug endpoints, and account route guards.
- `apps/server/package.json` – updated scripts and dependencies.
- `package.json` – added root test and smoke scripts.
- `apps/server/test/*` – new Vitest coverage for MCP and REST.
- `scripts/smoke/mcp-smoke.ts` – smoke tester writing diagnostics.
- `diagnostics/mcp-smoke.log` – output from smoke test.

## What to Watch
- External GW2 API calls can fail without network access; smoke test will report an error in that case.
- Adding new MCP methods requires updating both REST shims and JSON-RPC schemas.
- Ensure `Content-Type` remains accepted for JSON-RPC clients.
