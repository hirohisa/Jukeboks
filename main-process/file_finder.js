'use strict'

const define = require('../lib/define');
const sy = require('../lib/sy');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');

function deleteRelationlessData(directoryPath) {
  var removeKeys = []
  for(var key in storage) {
    var relative = path.relative(directoryPath, key)
    var separate = relative.split(path.sep)
    if (separate.length > 2) {
      removeKeys.push(key)
    }
  }

  for(var i in removeKeys) {
    delete storage[removeKeys[i]]
  }
}

const storage = {}

class FileFinder {

  search(directoryPath, callback) {
    deleteRelationlessData(directoryPath)
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
