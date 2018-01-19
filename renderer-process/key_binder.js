'use strict'

const ui = require('../lib/ui')
const ipc = require('electron').ipcRenderer;
document.addEventListener("keydown", (event) => {
  var data = {
    code: event.code,
    filePath: ui.getCurrent().getAttribute('href')
  };
  ipc.send('keydown', data);
})
