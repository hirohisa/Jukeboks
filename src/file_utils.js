'use strict'


function isNumber(x) {
  if (typeof (x) != 'number' && typeof (x) != 'string') {
    return false
  }
  return (x == parseFloat(x) && isFinite(x))
}

function structure(string) {
  var structure = []

  var s = ""
  var isSIsNumber = isNumber(string[0])
  for (var i in string) {
    var c = string[i]
    var isCIsNumber = isNumber(c)
    if (isSIsNumber == isCIsNumber) {
      s += c
    } else {
      structure.push(s)
      s = c
      isSIsNumber = isCIsNumber
    }
  }
  structure.push(s)
  return structure
}

module.exports.structure = structure

var toComparedString = function (str) {
  if (str == undefined) return str

  return str.toLowerCase()
}


var sortNumerically = function (a, b) {
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
      return _a.localeCompare(_b)
    }
    return aIsNumber ? -1 : 1
  }

  return aStructure.length < bStructure.length ? -1 : 1
}

module.exports.sortNumerically = sortNumerically

class O {

  constructor(dir) {
    this.dir = dir
  }

}

var sortNumericallyForDir = function (a, b) {
  return sortNumerically(a.dir.name, b.dir.name)
}

module.exports.sortDirs = function (dirs) {
  var objects = []
  for (var i in dirs) {
    var dir = dirs[i]
    if (!dir) continue
    if (dir.name.startsWith('.')) continue
    objects.push(new O(dir))
  }

  return objects.sort(sortNumericallyForDir).map((e, i, a) => {
    return e.dir
  })
}
