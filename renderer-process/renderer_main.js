'use strict'

const AppDelegater = require('./renderer-process/app_delegater.js')

const ipc = require('electron').ipcRenderer
const directoryContent = document.getElementById('path-directory')
const directoryContentInner = document.getElementById('path-directory-inner')
const app = new AppDelegater()

ipc.on('searchFiles', (event, data) => {
  app.navigator.render(data)
})

ipc.on('changeDirectory', (event, data) => {
  app.navigator.clear()
  app.loader.clear()
})

document.addEventListener("keydown" , (event) => {
  app.on(event)
})

document.getElementById('move-parent-directory').addEventListener("click", (event) => {
  app.on(event)
})

const menu = require('./renderer-process/menu.js')

window.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  menu.open(e);
}, false);

// document onload
function load() {
  app.navigator.start()
}
window.onload = load
