export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: unknown;
  id?: string | number | null;
}

export interface StatusResponse {
  ok: boolean;
  build: number;
}

export const TOOL_NAME = 'GW2 MCP';
