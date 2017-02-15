'use strict'

const FileNavigator = require('./file_navigator.js')
const MediaLoader = require('./media_loader.js')

function fileNavigatorOn(event) {
  var f = {}
  f["selectFile"] = function() {
    var srcs = []

    var href = event.data.getAttribute('href')
    loader.render(href)
    srcs.push(href)
    var next = event.data.nextSibling
    if (next) {
      href = next.getAttribute('href')
      loader.preRender(href)
      srcs.push(href)
    }
    var previous = event.data.previousSibling
    if (previous) {
      href = previous.getAttribute('href')
      loader.preRender(previous.getAttribute('href'))
      srcs.push(href)
    }

    loader.cleanContentsExclude(srcs)
  }

  f[event.type]()
}

function mediaLoaderOn(event) {
  var f = {}
  f["endVideo"] = function() {
    navigator.selectRandom()
  }

  f[event.type]()
}

const navigator = new FileNavigator({ on: fileNavigatorOn })
const loader = new MediaLoader({ on: mediaLoaderOn })

function onKeyboardEvent(event) {
  switch (event.code) {
    case "ArrowUp":
    navigator.prefiousSibling()
      break;
    case "ArrowDown":
    navigator.nextSibling()
      break;
    case "ArrowLeft":
    navigator.upDirectory()
      break;
    case "ArrowRight":
    navigator.downDirectory()
      break;
    case "Backspace":
    navigator.moveToTrash()
      break;
    default:
  }
}

function onMouseEvent(event) {
  var target = event.target
  var f = {}
  f["move-parent-directory"] = function() {
    navigator.upDirectory()
  }

  f[target.id]()
}

class AppDelegater {

  constructor() {
    this.navigator = navigator;
    this.loader = loader;
  }

  on(event) {
    switch (event.type) {
      case "keydown":
      onKeyboardEvent(event)
      break
      case "click":
      onMouseEvent(event)
      break
      default:
      break
    }
  }
}

module.exports = AppDelegater
