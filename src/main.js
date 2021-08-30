const electron = require('electron');
const app = electron.app

let win

function createWindow() {
  const BrowserWindow = electron.BrowserWindow
  win = new BrowserWindow({
    width: 1500,
    height: 1280,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      contextIsolation: false,
      javascript: true,
    },
    'accept-first-mouse': true,
    'title-bar-style': 'hidden'
  })

  const path = require('path');
  win.hide();
  win.loadURL(`file://${path.join(__dirname, 'index.html')}`);
  if (process.env.NODE_ENV == 'development') {
    win.webContents.openDevTools();
  }
  win.webContents.on('did-finish-load', () => {
    var data = {
      argv: process.argv,
      cwd: process.cwd()
    }
    win.webContents.send('jukeboks-open', data);
    win.show();
  });

  win.on('closed', () => {
    win = null
  })
}

require('./main-process/main.js');

function onReady() {
  createWindow();
}

// App

app.on('ready', onReady)
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
})
