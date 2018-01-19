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
