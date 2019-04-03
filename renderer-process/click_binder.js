'use strict'

const utils = require('./utils.js');
const ipc = require('electron').ipcRenderer;

function handleClick(id) {
  document.getElementById(id).addEventListener('click', (event) => {
    var data = {
      id: id
    };
    ipc.send('click', data);
  })
}

const clickedIdList = ['move-parent-directory', 'move-home-directory'];
clickedIdList.forEach(function(e) {
  handleClick(e);
})

const showBookmarksElement = document.getElementById('show-bookmarks');
showBookmarksElement.addEventListener("click", (event) => {
  ipc.send('requestBookmarks', {});
})

const directoryPath = document.getElementById('path-directory');
directoryPath.addEventListener("click", (event) => {
  var data = {
    id: 'bookmark-path',
    path: event.target.getAttribute('href')
  };
  ipc.send('bookmark-path', data);
});

const changeLayoutElement = document.getElementById('change-layout');
changeLayoutElement.addEventListener("click", (event) => {
  ipc.send('changeLayout', {});
})

ipc.on('didMoveDirectory', function(event, data) {
  var isShowingContent = utils.isShowingContent();
  if (!isShowingContent) {
    changeLayoutElement.click();
  }
})
