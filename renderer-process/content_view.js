'use strict'

const mainContent = document.getElementById('main-content')
const videoSlider = document.getElementById('video-slider')
var videoTimer;

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
  if (element && isActive()) {
    element.className = "visible"
    mainContent.appendChild(element)
    if (element.tagName.toLowerCase() == 'video') {
      element.addEventListener("ended", function() {
        ipc.send('endedVideo')
      }, true)
    }
  }

  displayVideoSlider()
}

function displayVideoSlider() {
  if (isDisplayingVideo()) {
    videoTimer = setInterval(seekVideo, 1000)
    videoSlider.style.display =  "block";
  } else {
    clearInterval(videoTimer);
    videoSlider.style.display =  "none";
  }
}

function moveVideoTime(event) {
  if (!onVideoContent(event)) return;

  var mainContentRect = mainContent.getBoundingClientRect()
  var ratio = (event.x - mainContentRect.left) / mainContentRect.width;
  moveCurrentTimeOfVideoWithRatio(ratio)
}

function moveCurrentTimeOfVideoWithRatio(ratio) {
  const video = mainContent.firstChild;
  if (ratio < 0.0) ratio = 0.0
  if (ratio > 1.0) ratio = 1.0
  video.currentTime = video.duration * ratio;
}

function reflectCurrentTimeOnSlider(ratio) {
  videoSlider.value = 100 * ratio
}

function seekVideo() {
  if (!isDisplayingVideo()) return;

  const video = mainContent.firstChild;
  var ratio = video.currentTime / video.duration;
  reflectCurrentTimeOnSlider(ratio);
}

function isActive() {
  if (mainContent.style.display == "none") { return false; }

  return true;
}

function isDisplayingVideo() {
  if (!isActive()) { return false }
  if (!mainContent.firstChild) { return false; }

  return mainContent.firstChild.tagName.toLowerCase() == 'video';
}

videoSlider.addEventListener("change", (event) => {
  var ratio = videoSlider.value / 100;
  moveCurrentTimeOfVideoWithRatio(ratio);
})

const ipc = require('electron').ipcRenderer;

ipc.on('selectFile', function(event, data) {

  cleanContents()
  render(data.filePath)

})

ipc.on('keydown', (event, data) => {
  switch (data.code) {
    case "ArrowRight":
    if (isDisplayingVideo()) {
      var ratio = (videoSlider.value + 5) / 100;
      moveCurrentTimeOfVideoWithRatio(ratio);
    }
      break;
    default:
  }
})
