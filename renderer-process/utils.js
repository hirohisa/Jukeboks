'use strict'
const path = require('path')
const ipc = require('electron').ipcRenderer

module.exports.jump = function(directoryPath, referer = undefined) {
  directoryPath = path.normalize(directoryPath)
  var data = {
    path: directoryPath,
    referer: referer
  }

  ipc.send('movePath', data)
}

const mainContent = document.getElementById('main-content')
const mainCollection = document.getElementById('main-collection')

module.exports.showContent = function() {
  mainContent.style.display =  "block";
  mainCollection.style.display =  "none";
}

module.exports.showCollection = function() {
  mainContent.style.display =  "none";
  mainCollection.style.display =  "block";
}

module.exports.isShowingContent = function() {
  if (mainContent.style.display ==  "block") {
    return true;
  }
  if (mainContent.style.display == undefined) {
    return true;
  }

  return false;
}

module.exports.cleanContents = function() {
  while (mainContent.firstChild) {
      mainContent.removeChild(mainContent.firstChild)
  }

  while (mainCollection.firstChild) {
      mainCollection.removeChild(mainCollection.firstChild)
  }
  const videoSlider = document.getElementById('video-slider');
  videoSlider.style.display =  "none";
}
