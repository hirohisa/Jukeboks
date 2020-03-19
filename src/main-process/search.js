'use strict';

const fileFinder = require('./file_finder.js');
const bookmarker = require('./bookmarker.js');
const virtualFinder = require('./virtual_finder.js');
const D = require('../d.js');
const path = require('path');

function searchFiles(sender, data, identifer) {
  fileFinder.search(data.d.path, (ds) => {
    var result = {
      path: data.path,
      ds: ds,
      referer: data.referer
    };
    sender.send(identifer, result);
  })
}

function searchVirtualFiles(sender, data, identifer) {
  virtualFinder.search(data.d.path, (ds) => {
    var result = {
      path: data.path,
      ds: ds,
      referer: data.referer
    };
    sender.send(identifer, result);
  })
}

function search(sender, data, identifer) {
  const define = require('../define');
  if (data.d.path.startsWith(define.virtualPath)) {
    searchVirtualFiles(sender, data, identifer);
  } else {
    searchFiles(sender, data, identifer);
  }

}

function fetchBookmarks(sender, identifer) {
  bookmarker.selectAll((docs) => {
    var result = {
      path: '/Bookmarks',
      ds: docs.map((doc) => {
        return new D(path.basename(doc.path), doc.path, true)
      }),
    };
    sender.send(identifer, result);
  });
}

const ipc = require('electron').ipcMain;
ipc.on('movePath', function (event, data) {
  bookmarker.has(data.d.path, (isBookmarked) => {
    data.isBookmarked = isBookmarked;
    event.sender.send('didMoveDirectory', data);
    search(event.sender, data, 'searchFiles');
  });
})
ipc.on('requestFiles', function (event, data) {
  search(event.sender, data, 'responseFiles');
})
ipc.on('requestBookmarks', function (event, data) {
  fetchBookmarks(event.sender, 'searchFiles');
})