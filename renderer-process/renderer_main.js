const functions = require('./renderer-process/functions.js')
const AppDelegater = require('./renderer-process/app_delegater.js')

const ipc = require('electron').ipcRenderer
const directoryContent = document.getElementById('path-directory')
const directoryContentInner = document.getElementById('path-directory-inner')
const app = new AppDelegater()

ipc.on('searchFiles', (event, data) => {
  app.render(data)
})

document.addEventListener("keydown" , (event) => {
  app.on(event)
})

document.getElementById('move-parent-directory').addEventListener("click", (event) => {
  app.on(event)
})

// document onload
function load() {
  var home = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
  functions.jump(home)
}
window.onload = load
