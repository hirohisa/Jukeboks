'use strict';

require('./search.js');
const fileFinder = require('./file_finder.js');
const bookmarker = require('./bookmarker.js');

const ipc = require('electron').ipcMain;

ipc.on('moveToTrash', function(event, data) {
    fileFinder.moveToTrash(event, data.filePath)
})

ipc.on('keydown', function(event, data) {
  event.sender.send('keydown', data);
})

ipc.on('bookmark-path', function(event, data) {
  if (data.path == undefined) { return; }

  bookmarker.create(data.path, () => { });
})

// delegate
const proxyList = ['click', 'endedVideo', 'selectFile', 'changeLayout', 'selectCurrent']
proxyList.forEach(function(e) {
  ipc.on(e, function(event, data) {
    event.sender.send(e, data);
  })
})
