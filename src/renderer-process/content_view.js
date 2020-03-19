'use strict'

const mainContent = document.getElementById('main-content')
const videoSlider = document.getElementById('video-slider')
const sy = require('../system');
const utils = require('./utils');
const queue = require('queue');
var q = queue();
q.autostart = true;

var videoTimer;

var MEDIA = {
  UNDEFINED: 0,
  IMAGE: 1,
  VIDEO: 2
}

function ext(filePath) {
  if (!filePath) return MEDIA.UNDEFINED;
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

function render(filePath) {
  filePath = filePath.split('/').map(s => encodeURIComponent(s)).join('/')
  var src = "file://" + filePath
  var element = createContent(filePath)
  if (element && isActive()) {
    element.className = "visible"
    mainContent.appendChild(element)
    if (element.tagName.toLowerCase() == 'video') {
      element.addEventListener("play", function (e) {
        var timeLabel = document.getElementById("video-time-label");
        var duration = e.target.duration + 1
        var minutes = Math.floor(duration / 60)
        var seconds = ('0' + Math.floor(duration % 60)).slice(-2)
        timeLabel.innerHTML = minutes + ':' + seconds
      }, true);
      element.addEventListener("ended", function () {
        ipc.send('endedVideo')
      }, true);
    }
  }

  displayVideoSlider()
}

function displayVideoSlider() {
  if (isDisplayingVideo()) {
    videoTimer = setInterval(seekVideo, 1000)
    videoSlider.style.display = "block";
  } else {
    clearInterval(videoTimer);
    videoSlider.style.display = "none";
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

var stored = undefined;
ipc.on('selectFile', function (event, data) {
  stored = data.filePath;
  if (utils.isShowingContent()) {
    utils.cleanContents();
    render(data.filePath);
  }
})

ipc.on('changeLayoutToContent', function (event, data) {
  utils.cleanContents();
  render(stored);
})

ipc.on('keydown', (event, data) => {
  switch (data.code) {
    case "ArrowRight":
      if (isDisplayingVideo()) {
        const video = mainContent.firstChild;
        q.push(
          () => {
            var seconds = video.duration / 100;
            video.currentTime = video.currentTime + seconds;
          }
        );
      }
      break;
    default:
  }
})
