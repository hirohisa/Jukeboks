const functions = require('./renderer-process/functions.js')
const AppDelegater = require('./renderer-process/app_delegater.js')

const ipc = require('electron').ipcRenderer
const pathInput = document.getElementById('path-input')
const app = new AppDelegater()

// input path
pathInput.addEventListener('input', function() {
  functions.jump(pathInput.value)
})

ipc.on('searchFiles', (event, data) => {
  app.render(data)
  // todo: app.navigator.render(data)
})

document.addEventListener("keydown" , (event) => {
  app.on(event)
})

// document onload
function load() {
  functions.jump(__dirname)
}
window.onload = load
