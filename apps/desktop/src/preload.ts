import { contextBridge, ipcRenderer } from 'electron';

async function getStatus() {
  try {
    const res = await fetch('http://127.0.0.1:5123/api/status');
    const json = await res.json();
    return { key: json.hasApiKey, server: true };
  } catch {
    return { key: false, server: false };
  }
}

async function setApiKey(key: string) {
  await fetch('http://127.0.0.1:5123/api/settings/gw2key', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ key }),
  });
}

async function deleteApiKey() {
  await fetch('http://127.0.0.1:5123/api/settings/gw2key', { method: 'DELETE' });
}

contextBridge.exposeInMainWorld('api', {
  getStatus,
  setApiKey,
  deleteApiKey,
  startServer: () => ipcRenderer.invoke('start-server'),
  stopServer: () => ipcRenderer.invoke('stop-server'),
  copyEndpoint: () => ipcRenderer.invoke('copy-endpoint'),
});
