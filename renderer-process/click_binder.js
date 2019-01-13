'use strict'

const utils = require('./utils.js');

const ipc = require('electron').ipcRenderer;
document.getElementById('move-parent-directory').addEventListener("click", (event) => {
  var data = {
    id: 'move-parent-directory'
  };
  ipc.send('click', data);
})

document.getElementById('move-home-directory').addEventListener("click", (event) => {
  var data = {
    id: 'move-home-directory'
  };
  ipc.send('click', data);
})

var changeLayoutElement = document.getElementById('change-layout');
changeLayoutElement.addEventListener("click", (event) => {
  ipc.send('changeLayout', {});
})

ipc.on('didMoveDirectory', function(event, data) {
  var isShowingContent = utils.isShowingContent();
  if (!isShowingContent) {
    changeLayoutElement.click();
  }
})
