'use strict'

const _ = require('underscore')

var MEDIA = {
  UNKNOWN : 0,
  IMAGE: 1,
  VIDEO: 2
}

function ext(filePath, callback) {
  if (!filePath) return MEDIA.UNKNOWN;
  const fs = require('fs');

  try {
    var stats = fs.lstatSync(filePath);
  } catch(e) {
    return MEDIA.UNKNOWN;
  }

  if (stats.isDirectory()) return MEDIA.UNKNOWN;
  const path = require('path')
  switch (path.extname(filePath)) {
    case ".mp3":
    case ".mp4":
    callback(MEDIA.VIDEO)
    break
    default:
    break
  }

  const fastimage = require('fastimage')
  fastimage.info(filePath)
  .then(function(info){
    callback(MEDIA.IMAGE)
  })
  .catch(function(error){
    callback(MEDIA.UNKNOWN)
  })
}

function createImage(src) {
  var img = document.createElement("img")
  img.src = src
  return img
}

function createVideo(src) {
  var video = document.createElement("video")
  video.src = src
  video.autoplay = true
  return video
}

function clearContents() {
  while (mainContent.firstChild) {
      mainContent.removeChild(mainContent.firstChild)
  }
}

const mainContent = document.getElementById('main-content')

class MediaLoader {

  constructor(transport) {
    this.transport = transport
  }

  clearContent() {
    clearContents()
  }

  cleanContentsExclude(srcs) {
    var removeNodes = []
    for (var i in mainContent.childNodes) {
      var node = mainContent.childNodes[i]
      if (!node.nodeName) continue

      var src = node.src.replace(/^file:\/\//,'')
      if (!_.contains(srcs, src)) {
        removeNodes.push(node)
      }
    }

    for (var i in removeNodes) {
      var node = removeNodes[i]
      mainContent.removeChild(node)
    }
  }

  preRender(filePath) {
    var src = "file://" + filePath
    var f = {}
    f[MEDIA.IMAGE] = function() {
      var hit
      for (var i in mainContent.childNodes) {
        var node = mainContent.childNodes[i]
        if (!node.nodeName) continue
        if (node.nodeName.toLowerCase() != "img") continue

        if (src == node.src) {
          hit = node
          break
        }
      }

      if (!hit) {
        var element = createImage(src)
        element.className = "hidden"
        mainContent.appendChild(element)
      }
    }
    f[MEDIA.VIDEO] = function() {}
    f[MEDIA.UNKNOWN] = function() {}

    ext(filePath, (e) => {
      f[e]()
    });
  }

  render(filePath) {
    var self = this
    var src = "file://" + filePath
    var f = {}
    f[MEDIA.IMAGE] = function() {
      var hit
      for (var i in mainContent.childNodes) {
        var node = mainContent.childNodes[i]
        if (!node.nodeName) continue
        if (node.nodeName.toLowerCase() != "img") continue

        if (src == node.src) {
          hit = node
          node.className = "visible"
        } else {
          node.className = "hidden"
        }
      }

      if (!hit) {
        var element = createImage(src)
        element.className = "visible"
        mainContent.appendChild(element)
      }
    }
    f[MEDIA.VIDEO] = function() {
      clearContents()
      var element = createVideo(src)
      element.addEventListener("ended", function() {
        self.transport.on({type: 'endVideo'})
      }, true)

      mainContent.appendChild(element)
    }
    f[MEDIA.UNKNOWN] = function() {}

    ext(filePath, (e) => {
      f[e]()
    });
  }
}

module.exports = MediaLoader
