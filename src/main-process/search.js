'use strict';

const fileFinder = require('./file_finder.js');
const bookmarker = require('./bookmarker.js');
const tagFinder = require('./tag_finder.js');

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

function searchTagFiles(sender, data, identifer) {
  tagFinder.search(data.d.path, (ds) => {
    var result = {
      path: data.path,
      ds: ds,
      referer: data.referer
    };
    sender.send(identifer, result);
  })
}

function searchBookmarks(sender, identifer) {
  bookmarker.selectAll((ds) => {
    var result = {
      path: '/Bookmarks',
      ds: ds,
    };
    sender.send(identifer, result);
  });
}

function search(sender, data, identifer) {
  const define = require('../define');

  let rootDir = data.d.path.substring(1).split('/')[0]
  switch (rootDir) {
    case define.bookmarksPath.substring(1):
      searchBookmarks(sender, identifer);
      break;
    case define.tagPath.substring(1):
      searchTagFiles(sender, data, identifer);
      break;
    default:
      searchFiles(sender, data, identifer);
  }
}

function movePath(event, data) {
  bookmarker.has(data.d.path, (isBookmarked) => {
    data.isBookmarked = isBookmarked;
    event.sender.send('didMoveDirectory', data);
    search(event.sender, data, 'searchFiles');
  });
}

const ipc = require('electron').ipcMain;
ipc.on('movePath', movePath);
ipc.on('requestFiles', function (event, data) {
  search(event.sender, data, 'responseFiles');
})
