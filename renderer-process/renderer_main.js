'use strict'

const AppDelegater = require('./renderer-process/app_delegater.js');

const ipc = require('electron').ipcRenderer;
const app = new AppDelegater();

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

document.ondragover = document.ondrop = function (e) {
  e.preventDefault();
}

const sideBar = document.getElementById('sidebar');
sidebar.addEventListener('drop', function (event) {
  app.on(event)
});

// document onload
function load() {
  app.navigator.start();
}
window.onload = load
