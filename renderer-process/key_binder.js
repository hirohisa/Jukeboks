'use strict'

const ui = require('../lib/ui')
const ipc = require('electron').ipcRenderer;
document.addEventListener("keydown", (event) => {
  var filePath = undefined
  if (ui.getCurrent() != undefined) {
    filePath = ui.getCurrent().getAttribute('href')
  }

  var data = {
    code: event.code,
    filePath: filePath
  };
  ipc.send('keydown', data);
})
