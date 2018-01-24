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

module.exports.openDirectory = function(path) {
  const { spawn } = require('child_process');
  spawn('open', [path]);
}
