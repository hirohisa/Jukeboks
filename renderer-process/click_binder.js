'use strict'

const ipc = require('electron').ipcRenderer;
document.getElementById('move-parent-directory').addEventListener("click", (event) => {
  var data = {
    id: event.target.id
  };
  ipc.send('click', data);
})
