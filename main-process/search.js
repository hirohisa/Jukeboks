'use strict';

const fileFinder = require('./file_finder.js');
const bookmarker = require('./bookmarker.js');

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

function fetchBookmarks(sender, identifer) {
  bookmarker.selectAll((docs) => {
    var result = {
      path: '/bookmarks',
      files: docs.map((doc) => {
        return doc.path
      }),
    };
    sender.send(identifer, result);
  });
}

const ipc = require('electron').ipcMain;
ipc.on('movePath', function(event, data) {
  event.sender.send('didMoveDirectory', data);
  search(event.sender, data, 'searchFiles');
})
ipc.on('requestFiles', function(event, data) {
  search(event.sender, data, 'responseFiles');
})
ipc.on('requestBookmarks', function(event, data) {
  fetchBookmarks(event.sender, 'searchFiles');
})
