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
  removeKeys = []
  for(key in storage) {
    var relative = path.relative(directoryPath, key)
    var separate = relative.split(path.sep)
    if (separate.length > 2) {
      removeKeys.push(key)
    }
  }

  for(i in removeKeys) {
    delete storage[removeKeys[i]]
  }
}

function filter(files) {
  var renew = []
  for (var i in files) {
    var file = files[i]
    if (!file) continue
    if (file.startsWith('.')) continue

    renew.push(file)
  }

  return renew
}

var sort = function(a, b) {
  var aList = a.match(/\d+/g)
  var bList = b.match(/\d+/g)

  if (!aList || !bList) {
    return 0
  }

  for (i in aList) {
    var aInt = parseInt(aList[i])
    var bInt = parseInt(bList[i])
    if (aInt && bInt && aInt != bInt) {
      return aInt - bInt
    }
  }

  return 0
}

function findFiles(directoryPath, callback) {
  const fs = require('fs')
  fs.readdir(directoryPath, function(error, files) {
    if (error) files = []

    files = filter(files)
    var filePaths = convertFilePaths(directoryPath, files.sort(sort))

    storage[directoryPath] = filePaths
    callback(filePaths)
  })
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
    findFiles(directoryPath, callback)
  }
}

module.exports = FileFinder
