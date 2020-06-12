'use strict'


function isNumber(x) {
  if (typeof (x) != 'number' && typeof (x) != 'string') {
    return false
  }
  return (x == parseFloat(x) && isFinite(x))
}

function structure(string) {
  var structure = []

  var now = ""
  var isNowIsNumber = isNumber(string[0])
  for (var i in string) {
    var char = string[i]
    var isCharIsNumber = isNumber(char)
    if (isNowIsNumber == isCharIsNumber) {
      now += char
    } else {
      structure.push(now)
      now = char
      isNowIsNumber = isCharIsNumber
    }
  }
  structure.push(now)
  return structure
}

module.exports.structure = structure

var toComparedString = function (str) {
  if (str == undefined) return str

  str = str.replace(/[A-Za-z]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  })

  return str.toLowerCase()
}


var sortAlgorithm = function (a, b) {
  var aStructure = structure(a)
  var bStructure = structure(b)
  for (var i in aStructure) {
    var _a = toComparedString(aStructure[i])
    var _b = toComparedString(bStructure[i])
    if (_b == undefined) {
      return 1
    }
    if (_a == _b) {
      continue
    }

    var aIsNumber = isNumber(_a)
    var bIsNumber = isNumber(_b)
    if (aIsNumber && bIsNumber) {
      var nA = parseInt(_a)
      var nB = parseInt(_b)
      if (nA == nB) {
        continue
      }
      return nA < nB ? -1 : 1
    }
    if (!aIsNumber && !bIsNumber) {
      return _a < _b ? -1 : 1
    }
    return aIsNumber ? -1 : 1
  }

  return aStructure.length < bStructure.length ? -1 : 0
}

module.exports.sortAlgorithm = sortAlgorithm

class O {

  constructor(dir) {
    this.dir = dir
  }

}

module.exports.sortDirs = function (dirs) {
  var objects = []
  for (var i in dirs) {
    var dir = dirs[i]
    if (!dir) continue
    if (dir.name.startsWith('.')) continue
    objects.push(new O(dir))
  }

  return objects.sort(sortAlgorithm).map((e, i, a) => {
    return e.dir
  })
}
