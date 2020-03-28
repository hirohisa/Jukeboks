'use strict'

function isNumber(x) {
    if( typeof(x) != 'number' && typeof(x) != 'string' ) {
      return false
    }
    return (x == parseFloat(x) && isFinite(x))
}

function splitStructure(string) {
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

class O {

  constructor(dirent) {
    this.dirent = dirent
    this.structure = splitStructure(dirent.name)
  }

}

module.exports = O
