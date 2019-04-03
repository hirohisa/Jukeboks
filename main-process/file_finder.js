'use strict'

const define = require('../lib/define');
const sy = require('../lib/system');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');

function cleanData(directoryPath) {
  var removeKeys = [];
  for(var storedPath in storage) {
    if (!sy.keepDirectory(directoryPath, storedPath)) {
      removeKeys.push(storedPath);
    }
  }

  for(var i in removeKeys) {
    delete storage[removeKeys[i]];
  }
}

const storage = {}

class FileFinder {

  search(directoryPath, callback) {
    cleanData(directoryPath)
    directoryPath = path.normalize(directoryPath)
    var filePaths = storage[directoryPath]
    if (filePaths) {
      callback(filePaths)
      return
    }
    sy.findFiles(directoryPath, function(filePaths) {
      storage[directoryPath] = filePaths
      callback(filePaths)
    })
  }

  removeFileInStorage(filePath) {
    var directoryPath = path.dirname(filePath);
    storage[directoryPath] = _.without(storage[directoryPath], filePath);
  }

  moveToTrash(event, filePath) {
    if (filePath == undefined) return;

    var trashPath = define.rootPath + "/.Trash/" + path.basename(filePath);
    var self = this;
    fs.rename(filePath, trashPath, (e) => {
      if (!e) {
        var data = {
          path: filePath
        };

        self.removeFileInStorage(filePath)
        event.sender.send('removePath', data)
      }
    });
  }

}

module.exports = new FileFinder()
