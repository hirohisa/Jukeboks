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

const clickedIdList = ['move-parent-directory', 'move-home-directory', 'show-virtual-directory', 'show-bookmarks'];
clickedIdList.forEach(function (e) {
  handleClick(e);
})

const dirPath = document.getElementById('path-directory');
dirPath.addEventListener("click", (event) => {
  const directoryIcon = document.getElementById('path-directory-icon');
  let notYetBookmark = directoryIcon.className.indexOf('empty') > -1;
  let id = notYetBookmark ? 'bookmarkPath' : 'unbookmarkPath';
  let data = {
    id: id,
    path: dirPath.getAttribute('href')
  };
  ipc.send(id, data);
});

const changeLayoutElement = document.getElementById('change-layout-icon');
changeLayoutElement.addEventListener("click", (event) => {
  ipc.send('changeLayout', {});
})

ipc.on('didMoveDirectory', function (event, data) {
  var isShowingContent = utils.isShowingContent();
  if (!isShowingContent) {
    changeLayoutElement.click();
  }
})
