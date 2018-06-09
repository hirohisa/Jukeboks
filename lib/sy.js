'use strict'

module.exports.isDirectory = function(filePath) {
  const fs = require('fs');
  try {
    var stats = fs.lstatSync(filePath);
    return stats.isDirectory();
  } catch(e) {
    return false;
  }
}

module.exports.showInFinder = function(path) {
  const { spawn } = require('child_process');
  spawn('open', ["-R", path]);
}

function convertFilePaths(directoryPath, files) {
  var filePaths = []
  for (var i in files) {
    var file = files[i]
    if (!file) continue

    var filePath = directoryPath + '/' + file
    const path = require('path');
    filePaths.push(path.normalize(filePath))
  }

  return filePaths
}

const organizer = require('./file_organizer');

module.exports.findFiles = function(directoryPath, callback) {
  const fs = require('fs')
  fs.readdir(directoryPath, function(error, files) {
    if (error) files = []

    var filePaths = convertFilePaths(directoryPath, organizer.sortFiles(files))
    callback(filePaths)
  })
}
