import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell, clipboard } from 'electron';
import path from 'path';
// Defer resolving the server builder so dev can run independently.
let buildServer: undefined | (() => { start: () => Promise<any>; stop: () => Promise<any> });
function resolveServerBuilder() {
  if (buildServer) return buildServer;
  try {
    // Try workspace import (if packaged/built)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    buildServer = require('@gw2-mcp/server').startServer;
  } catch { buildServer = undefined; }
  return buildServer;
}

let tray: Tray | null = null;
let win: BrowserWindow | null = null;
let serverCtrl: ReturnType<NonNullable<typeof buildServer>> | null = null;
let isQuitting = false;
const ENDPOINT = 'http://127.0.0.1:5123/mcp';
const DOCS = 'http://127.0.0.1:5123/docs';

function createWindow() {
  if (win) return;
  win = new BrowserWindow({
    width: 400,
    height: 300,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, 'index.html'));
  }
  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      win?.hide();
    }
  });
  win.on('closed', () => {
    win = null;
  });
}

async function startServer() {
  if (serverCtrl) return;
  const builder = resolveServerBuilder();
  if (!builder) {
    console.warn('Server module not found. Start it via the VS Code launch config.');
    return;
  }
  serverCtrl = builder();
  await serverCtrl.start();
  shell.openExternal(DOCS);
}

async function stopServer() {
  if (!serverCtrl) return;
  await serverCtrl.stop();
  serverCtrl = null;
}

app.whenReady().then(() => {
  createWindow();
  tray = new Tray(nativeImage.createEmpty());
  const menu = Menu.buildFromTemplate([
    { label: 'Open Settings', click: () => { createWindow(); win?.show(); } },
    { label: 'Start Server', click: () => startServer() },
    { label: 'Stop Server', click: () => stopServer() },
    { label: 'Copy Endpoint', click: () => clipboard.writeText(ENDPOINT) },
    { label: 'Exit', click: () => app.quit() }
  ]);
  tray.setToolTip('GW2 MCP');
  tray.setContextMenu(menu);
});
app.on('before-quit', () => {
  isQuitting = true;
});
ipcMain.handle('start-server', () => startServer());
ipcMain.handle('stop-server', () => stopServer());
ipcMain.handle('copy-endpoint', () => {
  clipboard.writeText(ENDPOINT);
  return true;
});
