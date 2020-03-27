'use strict';

require('./menu.js');
require('./search.js');
const path = require('path');
const fileFinder = require('./file_finder.js');
const virtualFinder = require('./virtual_finder.js');
const bookmarker = require('./bookmarker.js');

const ipc = require('electron').ipcMain;

ipc.on('moveToTrash', function (event, data) {
  fileFinder.moveToTrash(event, data.filePath)
  virtualFinder.remove(data.filePath)
})

ipc.on('bookmarkPath', function (event, data) {
  if (!data.d) { return; }

  bookmarker.create(data.d.path, (result, updated) => {
    let fileName = path.basename(data.d.path);
    let message = updated ? `Updated directory [${fileName}]` : `Bookmarked directory [${fileName}]`;
    event.sender.send('showNotification', { message: message });
    event.sender.send('updateDirectoryData', data);
  });
})

ipc.on('unbookmarkPath', function (event, data) {
  if (!data.d) { return; }

  bookmarker.remove(data.d.path, () => {
    event.sender.send('updateDirectoryData', data);
  });
})

// delegate
const proxyList = ['click', 'keydown', 'updateSearchText', 'endedVideo', 'selectFile', 'changeLayout', 'selectCurrent']
proxyList.forEach(function (e) {
  ipc.on(e, function (event, data) {
    event.sender.send(e, data);
  })
})
