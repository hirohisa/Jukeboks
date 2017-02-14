'use strict';

const FileFinder = require('./file_finder.js');

const fileFinder = new FileFinder();
const ipc = require('electron').ipcMain;

ipc.on('inputPath', function(event, data) {
  event.sender.send('changeDirectory', data);
  fileFinder.search(data.path, (files) => {
    var result = {
      files: files,
      referer: data.referer
    };
    event.sender.send('searchFiles', result);
  })
})

ipc.on('removePath', function(event, data) {
  fileFinder.removeFileInStorage(data.path);
})
