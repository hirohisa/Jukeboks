module.exports = {
  jump: function(directoryPath, referer = undefined) {
    const path = require('path')
    pathInput.value = path.normalize(directoryPath)

    var data = {
      path: directoryPath,
      referer: referer
    }

    const ipc = require('electron').ipcRenderer
    ipc.send('inputPath', data)
  }
}
