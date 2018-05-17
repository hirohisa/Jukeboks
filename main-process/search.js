'use strict';

const fileFinder = require('./file_finder.js');

function search(sender, data, identifer) {
  fileFinder.search(data.path, (files) => {
    var result = {
      path: data.path,
      files: files,
      referer: data.referer
    };
    sender.send(identifer, result);
  })
}

const ipc = require('electron').ipcMain;
ipc.on('movePath', function(event, data) {
  event.sender.send('didMoveDirectory', data);
  search(event.sender, data, 'searchFiles');
})

ipc.on('requestFiles', function(event, data) {
  search(event.sender, data, 'responseFiles');
})

ipc.on('moveToTrash', function(event, data) {
  fileFinder.moveToTrash(event, data.filePath)
})

ipc.on('keydown', function(event, data) {
  event.sender.send('keydown', data);
})

// delegate
const proxyList = ['click', 'endedVideo', 'selectFile', 'changeLayoutToCollection', 'changeLayoutToContent']
proxyList.forEach(function(e) {
  ipc.on(e, function(event, data) {
    event.sender.send(e, data);
  })
})
