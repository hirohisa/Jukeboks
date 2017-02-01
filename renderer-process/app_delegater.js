const FileNavigator = require('./file_navigator.js')
const MediaLoader = require('./media_loader.js')

function fileNavigatorOn(event) {
  var f = {}
  f["selectFile"] = function() {
    loader.render(event.data.getAttribute('href'))
    var next = event.data.nextSibling
    if (next) {
      loader.preRender(next.getAttribute('href'))
    }
    var previous = event.data.previousSibling
    if (previous) {
      loader.preRender(previous.getAttribute('href'))
    }
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
