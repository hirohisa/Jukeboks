const path = require('path')
const directoryLink = document.getElementById('directory-link')

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

module.exports.getCurrent = function() {
  var current = document.getElementById('directory-current-page')
  if (current) {
    return current
  }

  current = directoryLink.firstChild
  if (!current) return

  current.id = 'directory-current-page'
  return current
}
