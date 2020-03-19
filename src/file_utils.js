'use strict'

const O = require('./o')

var sortAlgorithm = function(a, b) {
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

module.exports.sort = function(dirents) {
  var objects = []
  for (var i in dirents) {
    var dirent = dirents[i]
    if (!dirent) continue
    if (dirent.name.startsWith('.')) continue
    objects.push(new O(dirent))
  }

  return objects.sort(sortAlgorithm).map((e, i, a) => {
    return e.dirent
  })
}
