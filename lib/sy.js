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
