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

var layoutIconElement = document.getElementById('change-layout-icon');
var changeLayoutElement = document.getElementById('change-layout');
changeLayoutElement.addEventListener("click", (event) => {
  var isShowingContent = utils.isShowingContent();
  isShowingContent ? utils.showCollection() : utils.showContent();
  layoutIconElement.className = isShowingContent ? 'icon icon-layout' : 'icon icon-newspaper';
  var data = {};
  var sendingValue = isShowingContent ? 'changeLayoutToCollection' : 'changeLayoutToContent';
  ipc.send(sendingValue, data);
})

ipc.on('didMoveDirectory', function(event, data) {
  var isShowingContent = utils.isShowingContent();
  if (!isShowingContent) {
    changeLayoutElement.click();
  }
})
