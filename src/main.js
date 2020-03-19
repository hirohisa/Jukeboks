const electron = require('electron')
const app = electron.app

let win

function createWindow() {
  const BrowserWindow = electron.BrowserWindow
  win = new BrowserWindow({
    width: 1080,
    height: 800,
    webPreferences: { nodeIntegration: true },
    'accept-first-mouse': true,
    'title-bar-style': 'hidden'
  })

  const path = require('path')
  const url = require('url')
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (process.env.NODE_ENV == 'development') {
    win.webContents.openDevTools();
  }

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
