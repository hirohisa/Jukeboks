'use strict';

const path = require('path');
require('./search.js');
const fileFinder = require('./file_finder.js');
const bookmarker = require('./bookmarker.js');

const ipc = require('electron').ipcMain;

ipc.on('moveToTrash', function(event, data) {
    fileFinder.moveToTrash(event, data.filePath)
})

ipc.on('bookmarkPath', function(event, data) {
  if (!data.path) { return; }

  bookmarker.create(data.path, (result, updated) => {
    let fileName = path.basename(data.path);
    let message = updated ? `Updated directory [${fileName}]` : `Bookmarked directory [${fileName}]`;
    event.sender.send('showNotification', { message: message });
    event.sender.send('updateDirectoryData', data);
  });
})

ipc.on('unbookmarkPath', function(event, data) {
  if (!data.path) { return; }

  bookmarker.remove(data.path, () => {
    event.sender.send('updateDirectoryData', data);
  });
})

// delegate
const proxyList = ['click', 'keydown', 'updateSearchText', 'endedVideo', 'selectFile', 'changeLayout', 'selectCurrent']
proxyList.forEach(function(e) {
  ipc.on(e, function(event, data) {
    event.sender.send(e, data);
  })
})