const path = require('path')

module.exports.isDirectory = function(filePath) {
  const fs = require('fs');
  try {
    var stats = fs.lstatSync(filePath);
    return stats.isDirectory();
  } catch(e) {
    return false;
  }
}
