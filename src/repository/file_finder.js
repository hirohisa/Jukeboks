'use strict'

const define = require('../define');
const sy = require('../system');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');

function cleanData(dirPath) {
  var removeKeys = [];
  for (var storedPath in storage) {
    if (!sy.keepDirectory(dirPath, storedPath)) {
      removeKeys.push(storedPath);
    }
  }

  for (var i in removeKeys) {
    delete storage[removeKeys[i]];
  }
}

const storage = {}

class FileFinder {

  search(dirPath, callback) {
    cleanData(dirPath)
    dirPath = path.normalize(dirPath)
    var ds = storage[dirPath]
    if (ds) {
      callback(ds)
      return
    }
    sy.findFiles(dirPath, function (ds) {
      storage[dirPath] = ds
      callback(ds)
    })
  }

  removeFileInStorage(filePath) {
    var dirPath = path.dirname(filePath);
    storage[dirPath] = _.without(storage[dirPath], filePath);
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
