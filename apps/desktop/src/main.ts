import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } from 'electron';
import path from 'path';
import keytar from 'keytar';
import { spawn, ChildProcess } from 'child_process';

let tray: Tray | null = null;
let win: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

function startServer() {
  if (serverProcess) return;
  const serverPath = path.join(__dirname, '../../server/dist/index.js');
  serverProcess = spawn(process.execPath, [serverPath], { stdio: 'inherit' });
  serverProcess.on('exit', () => {
    serverProcess = null;
    getStatus().then((s) => win?.webContents.send('status', s));
  });
  getStatus().then((s) => win?.webContents.send('status', s));
}

function stopServer() {
  serverProcess?.kill();
  serverProcess = null;
  getStatus().then((s) => win?.webContents.send('status', s));
}

async function getStatus() {
  const key = await keytar.getPassword('gw2-mcp', 'api-key');
  return { key: !!key, server: !!serverProcess };
}

app.whenReady().then(() => {
  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip('GW2 MCP');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open', click: () => win?.show() },
      { label: 'Quit', click: () => app.quit() }
    ])
  );
  createWindow();
});

ipcMain.handle('get-status', getStatus);
ipcMain.handle('set-key', async (_e, key: string) => {
  if (key) await keytar.setPassword('gw2-mcp', 'api-key', key);
  else await keytar.deletePassword('gw2-mcp', 'api-key');
  return true;
});
ipcMain.handle('start-server', () => {
  startServer();
});
ipcMain.handle('stop-server', () => {
  stopServer();
});
