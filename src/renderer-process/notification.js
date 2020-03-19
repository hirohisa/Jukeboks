'use strict'

const ipc = require('electron').ipcRenderer;

const notificationFunction = function(data) {
  let notification = new Notification('Jukeboks', {
    silent: true,
    body: data.message
  });
};

ipc.on('showNotification', (event, data) => {
  notificationFunction(data);
});
