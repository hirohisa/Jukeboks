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

const bookmarkDirectoryIcon = document.getElementById('bookmark-directory');
bookmarkDirectoryIcon.addEventListener("click", (event) => {
  let notYetBookmark = event.target.getAttribute("name") == "bookmark-border";

  let id = notYetBookmark ? 'bookmarkPath' : 'unbookmarkPath';
  const navigator = require('./navigator')
  let data = {
    id: id,
    d: navigator.getCurrent()
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
