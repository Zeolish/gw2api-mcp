export type McpRequest = { id: string; method: string; params?: unknown };
export type McpResponse = { id: string; result?: unknown; error?: { code: number; message: string } };

export type StatusResponse = { hasApiKey: boolean; server: "running"|"stopped"; port: number };
export type SetGw2KeyRequest = { key: string };

export type PriceDto = { itemId: number; buy: number; sell: number; asOfUtc: string };
export type InventorySnapshotDto = {
  materials: Record<number, number>;
  bank: Record<number, number>;
  characterTotals: Record<number, number>;
  wallet: Record<string, number>;
};

export const ToolNames = {
  GetStatus: "gw2.getStatus",
  SetApiKey: "gw2.setApiKey",
  DeleteApiKey: "gw2.deleteApiKey",
  ItemsGet: "gw2.items.get",
  ItemsSearchByName: "gw2.items.searchByName",
  RecipesGet: "gw2.recipes.get",
  RecipesSearchByOutputItemId: "gw2.recipes.searchByOutputItemId",
  PricesGet: "gw2.prices.get",
  AccountMaterials: "gw2.account.getMaterials",
  AccountBank: "gw2.account.getBank",
  AccountCharacters: "gw2.account.getCharacters",
  AccountWallet: "gw2.account.getWallet",
} as const;
