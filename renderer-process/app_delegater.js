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

  f["changeDirectory"] = function() {
    loader.clearContent()
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
  var f = {}
  f["ArrowUp"] = function() {
    navigator.prefiousSibling()
  }
  f["ArrowDown"] = function() {
    navigator.nextSibling()
  }
  f["ArrowLeft"] = function() {
    navigator.upDirectory()
  }
  f["ArrowRight"] = function() {
    navigator.downDirectory()
  }
  f["Backspace"] = function() {
    navigator.moveToTrash()
  }

  f[event.code]()
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

  render(data) {
    navigator.render(data)
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

  start() {
    navigator.start()
  }
}

module.exports = AppDelegater
