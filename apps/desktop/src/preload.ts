import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getStatus: () => ipcRenderer.invoke('get-status'),
  setApiKey: (key: string) => ipcRenderer.invoke('set-api-key', key),
  deleteApiKey: () => ipcRenderer.invoke('delete-api-key'),
  startServer: () => ipcRenderer.invoke('start-server'),
  stopServer: () => ipcRenderer.invoke('stop-server'),
  copyEndpoint: () => ipcRenderer.invoke('copy-endpoint')
});
