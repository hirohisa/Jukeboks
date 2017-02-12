const electron = require('electron')
const app = electron.app

let win

function createWindow() {
  const BrowserWindow = electron.BrowserWindow
  win = new BrowserWindow({
    width: 1080,
    height: 800,
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
    openDevTools()
  }

  win.on('closed', () => {
    win = null
  })
}

function registerShortcut() {
  electron.globalShortcut.register('Command+Y', () => {
    openDevTools();
  });
}

function unregisterShortcut() {
  electron.globalShortcut.unregister('Command+Y');
}

function openDevTools() {
  win.webContents.openDevTools();
}

require('./main-process/search.js');

function onReady() {
  createWindow();
  registerShortcut();
}

// App

app.on('ready', onReady)
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
})
app.on('will-quit', function() {
  unregisterShortcut();
});
