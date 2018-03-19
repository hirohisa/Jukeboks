'use strict'

const mainContent = document.getElementById('main-content')

var MEDIA = {
  UNDEFINED : 0,
  IMAGE: 1,
  VIDEO: 2
}

function ext(filePath) {
  if (!filePath) return MEDIA.UNDEFINED;
  const sy = require('../lib/sy')
  if (sy.isDirectory(filePath)) return MEDIA.UNDEFINED;
  const path = require('path');
  var extname = path.extname(filePath).toLowerCase();
  switch (extname) {
    case ".mp3":
    case ".mp4":
    return MEDIA.VIDEO;
    break
    case ".jpeg":
    case ".jpg":
    case ".png":
    case ".gif":
    case ".svn":
    return MEDIA.IMAGE;
    break;
    default:
    break
  }
  return MEDIA.UNDEFINED;
}

function createContent(src) {
  var element = undefined
  switch (ext(src)) {
    case MEDIA.VIDEO:
    element = document.createElement("video")
    element.src = src
    element.autoplay = true
    break
    case MEDIA.IMAGE:
    element = document.createElement("img")
    element.src = src
    break
    default:
    break
  }

  return element
}

function cleanContents() {
  while (mainContent.firstChild) {
      mainContent.removeChild(mainContent.firstChild)
  }
}

function render(filePath) {
  var self = this
  var src = "file://" + filePath
  var f = {}

  var element = createContent(filePath)
  if (element) {
    element.className = "visible"
    mainContent.appendChild(element)

    if (element.tagName.toLowerCase() == 'video') {
      element.addEventListener("ended", function() {
        ipc.send('endedVideo')
      }, true)
    }
  }

}

function moveVideoTime(event) {
  if (!onVideoContent(event)) return;

  var mainContentRect = mainContent.getBoundingClientRect()

  const video = mainContent.firstChild;

  var timeX = (event.x - mainContentRect.left) / mainContentRect.width;
  video.currentTime = video.duration * timeX;
}

function onVideoContent(event) {
  if (!mainContent.firstChild) {
    return false;
  }
  if (mainContent.firstChild.tagName.toLowerCase() != 'video') {
    return false;
  }

  if (event.x < mainContent.getBoundingClientRect().left) {
    return false;
  }

  return true;
}

document.onmousemove = moveVideoTime;

const ipc = require('electron').ipcRenderer;

ipc.on('selectFile', function(event, data) {

  cleanContents()
  render(data.filePath)

})
