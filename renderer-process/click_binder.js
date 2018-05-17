'use strict'

const utils = require('./utils.js');

const ipc = require('electron').ipcRenderer;
document.getElementById('move-parent-directory').addEventListener("click", (event) => {
  var data = {
    id: event.target.id
  };
  ipc.send('click', data);
})

document.getElementById('move-home-directory').addEventListener("click", (event) => {
  var data = {
    id: event.target.id
  };

  ipc.send('click', data);
})

document.getElementById('change-layout').addEventListener("click", (event) => {
  var isShowingContent = utils.isShowingContent();
  isShowingContent ? utils.showCollection() : utils.showContent();
  event.target.className = isShowingContent ? 'icon icon-layout' : 'icon icon-newspaper';
  var data = {};
  var sendingValue = isShowingContent ? 'changeLayoutToCollection' : 'changeLayoutToContent';
  ipc.send(sendingValue, data);
})
