'use strict'

function fileNavigatorOn(event) {
  var f = {}
  f["selectFile"] = function() {
    var href = event.data.getAttribute('href')
    loader.render(href)
    loader.cleanContentsExclude([href])
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

// TODO: MediaContentView instead of MediaLoader
const MediaLoader = require('./media_loader.js')
const loader = new MediaLoader({ on: mediaLoaderOn })
