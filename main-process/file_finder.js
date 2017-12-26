'use strict'

const fileOrganizer = require('./file_organizer');
const _ = require('underscore');

function convertFilePaths(directoryPath, files) {
  const path = require('path')
  var filePaths = []
  for (var i in files) {
    var file = files[i]
    if (!file) continue

    var filePath = directoryPath + '/' + file
    filePaths.push(path.normalize(filePath))
  }

  return filePaths
}

function deleteRelationlessData(directoryPath) {
  const path = require('path')
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

var sort = function(a, b) {
  var aList = a.match(/\d+/g)
  var bList = b.match(/\d+/g)

  if (!aList || !bList) {
    return 0
  }

  for (var i in aList) {
    var aInt = parseInt(aList[i])
    var bInt = parseInt(bList[i])
    if (aInt && bInt && aInt != bInt) {
      return aInt - bInt
    }
  }

  return 0
}

const storage = {}

class FileFinder {

  search(directoryPath, callback) {
    deleteRelationlessData(directoryPath)
    const path = require('path')
    directoryPath = path.normalize(directoryPath)
    var filePaths = storage[directoryPath]
    if (filePaths) {
      callback(filePaths)
      return
    }
    this.findFiles(directoryPath, callback)
  }

  findFiles(directoryPath, callback) {
    const fs = require('fs')
    fs.readdir(directoryPath, function(error, files) {
      if (error) files = []

      var filePaths = convertFilePaths(directoryPath, fileOrganizer.sortFiles(files))

      storage[directoryPath] = filePaths
      callback(filePaths)
    })
  }

  removeFileInStorage(filePath) {
    const path = require('path');
    var directoryPath = path.dirname(filePath);
    storage[directoryPath] = _.without(storage[directoryPath], filePath);
  }

}

module.exports = new FileFinder()
