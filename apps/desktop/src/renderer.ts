declare const api: {
  getStatus(): Promise<{ key: boolean; server: boolean }>;
  setApiKey(key: string): Promise<void>;
  deleteApiKey(): Promise<void>;
  startServer(): Promise<void>;
  stopServer(): Promise<void>;
  copyEndpoint(): Promise<void>;
};

const endpoint = 'http://127.0.0.1:5123/mcp';
(document.getElementById('endpoint') as HTMLElement).textContent = endpoint;

async function refresh() {
  const status = await api.getStatus();
  document.getElementById('keyStatus')!.textContent = status.key ? 'Key Present' : 'Key Missing';
  document.getElementById('serverStatus')!.textContent = status.server ? 'Server Running' : 'Server Stopped';
}

(document.getElementById('saveKey') as HTMLButtonElement).onclick = async () => {
  const value = (document.getElementById('keyInput') as HTMLInputElement).value;
  await api.setApiKey(value);
  refresh();
};

(document.getElementById('deleteKey') as HTMLButtonElement).onclick = async () => {
  await api.deleteApiKey();
  refresh();
};

(document.getElementById('startServer') as HTMLButtonElement).onclick = async () => {
  await api.startServer();
  refresh();
};

(document.getElementById('stopServer') as HTMLButtonElement).onclick = async () => {
  await api.stopServer();
  refresh();
};

(document.getElementById('copyEndpoint') as HTMLButtonElement).onclick = () => {
  api.copyEndpoint();
};

refresh();
