'use strict'

const O = require('./o')

var sort = function(a, b) {
  for (var i in a.structure) {
    var _a = a.structure[i]
    var _b = b.structure[i]
    if (_a == _b) {
      continue
    }

    var isAisNumber = isNumber(_a)
    var isBisNumber = isNumber(_b)
    if (isAisNumber && isBisNumber) {
      return parseInt(_a) - parseInt(_b)
    }
    if (!isAisNumber && !isBisNumber) {
      return _a < _b ? -1 : 1
    }

    return isAisNumber ? -1 : 1
  }

  return 0
}

function isNumber(x) {
    if( typeof(x) != 'number' && typeof(x) != 'string' ) {
      return false
    }
    return (x == parseFloat(x) && isFinite(x))
}

class FileOrganizer {

  sortFiles(files) {
    var objects = []
    for (var i in files) {
      var file = files[i]
      if (!file) continue
      if (file.startsWith('.')) continue
      objects.push(new O(file))
    }

    return objects.sort(sort).map((e, i, a) => {
      return e.file
    })
  }

}

module.exports = FileOrganizer
