'use strict';

const fileFinder = require('./file_finder.js');
const bookmarker = require('./bookmarker.js');
const D = require('../lib/d.js');
const path = require('path');

function search(sender, data, identifer) {
  fileFinder.search(data.path, (ds) => {
    var result = {
      path: data.path,
      ds: ds,
      referer: data.referer
    };
    sender.send(identifer, result);
  })
}

function fetchBookmarks(sender, identifer) {
  bookmarker.selectAll((docs) => {
    var result = {
      path: '/bookmarks',
      ds: docs.map((doc) => {
        return new D(path.basename(doc.path), doc.path, true)
      }),
    };
    sender.send(identifer, result);
  });
}

const ipc = require('electron').ipcMain;
ipc.on('movePath', function(event, data) {
  bookmarker.has(data.path, (isBookmarked) => {
    data.isBookmarked = isBookmarked;
    event.sender.send('didMoveDirectory', data);
    search(event.sender, data, 'searchFiles');
  });
})
ipc.on('requestFiles', function(event, data) {
  search(event.sender, data, 'responseFiles');
})
ipc.on('requestBookmarks', function(event, data) {
  fetchBookmarks(event.sender, 'searchFiles');
})
