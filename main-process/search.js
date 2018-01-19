'use strict';

const fileFinder = require('./file_finder.js');

const ipc = require('electron').ipcMain;
ipc.on('movePath', function(event, data) {
  event.sender.send('didMoveDirectory', data);

  const queue = require('queue');
  var q = queue();

  q.push(

    () => {
      fileFinder.search(data.path, (files) => {
        var result = {
          path: data.path,
          files: files,
          referer: data.referer
        };
        event.sender.send('searchFiles', result);
      });
    }
  );

  q.start();

})

ipc.on('keydown', function(event, data) {
  switch (data.code) {
    case "Backspace":
    fileFinder.moveToTrash(event, data.filePath)
      break;
    default:
  }
  event.sender.send('keydown', data);
})

ipc.on('click', function(event, data) {
  event.sender.send('click', data);
})
