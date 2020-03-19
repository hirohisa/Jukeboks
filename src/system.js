'use strict'
const D = require('./d.js');
const organizer = require('./file_utils.js');
const path = require('path');

module.exports.isDirectory = function (filePath) {
  const define = require('./define');
  if (filePath.startsWith(define.virtualPath)) {
    return true;
  }

  const fs = require('fs');
  try {
    var stats = fs.lstatSync(filePath);
    return stats.isDirectory();
  } catch (e) {
    return false;
  }
}

module.exports.showInFinder = function (path) {
  const { spawn } = require('child_process');
  spawn('open', ["-R", path]);
}

function convert(dirPath, dirents) {
  return dirents.map((e) => {
    let ePath = path.normalize(dirPath + '/' + e.name)
    return new D(e.name, ePath, e.isDirectory())
  })
}

module.exports.findFiles = function (dirPath, callback) {
  const fs = require('fs')
  fs.readdir(dirPath, { withFileTypes: true }, function (error, dirs) {
    if (error) dirs = []
    callback(convert(dirPath, organizer.sort(dirs)))
  })
}

module.exports.keepDirectory = function (current, src) {
  if (!current.startsWith(src)) {
    return false;
  }

  return true;
}
