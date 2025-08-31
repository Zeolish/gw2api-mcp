declare const api: {
  getStatus(): Promise<{ key: boolean; server: boolean }>;
  setKey(key: string): Promise<void>;
  startServer(): Promise<void>;
  stopServer(): Promise<void>;
};

async function refresh() {
  const status = await api.getStatus();
  document.getElementById('key')!.textContent = status.key ? 'Present' : 'Missing';
  document.getElementById('server')!.textContent = status.server ? 'Running' : 'Stopped';
}

(document.getElementById('setKey') as HTMLButtonElement).onclick = async () => {
  const value = (document.getElementById('keyInput') as HTMLInputElement).value;
  await api.setKey(value);
  refresh();
};

(document.getElementById('start') as HTMLButtonElement).onclick = async () => {
  await api.startServer();
  refresh();
};

(document.getElementById('stop') as HTMLButtonElement).onclick = async () => {
  await api.stopServer();
  refresh();
};

refresh();
