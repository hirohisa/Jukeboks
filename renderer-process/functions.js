module.exports = {
  jump: function(directoryPath, referer = undefined) {
    const path = require('path')
    directoryPath = path.normalize(directoryPath)
    directoryContent.setAttribute('href', directoryPath)
    directoryContentInner.innerHTML = path.basename(directoryPath)

    var data = {
      path: directoryPath,
      referer: referer
    }

    const ipc = require('electron').ipcRenderer
    ipc.send('inputPath', data)
  }
}
