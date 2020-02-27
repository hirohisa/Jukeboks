'use strict';

const define = require('../lib/define');
const D = require('../lib/d');
const filePath = define.rootPath + "/.Jukeboks/virtual_directory.csv";
const fs = require('fs');
const readStream = fs.createReadStream(filePath);
const readline = require('readline');
const reader = readline.createInterface(readStream, {});
const path = require('path');

var storage = {};

async function sortStorage() {
  for (var key in storage) {
    storage[key] = storage[key].sort(function (a, b) {
      if (a.name > b.name) {
        return 1;
      } else {
        return -1;
      }
    })
  }
}

function read() {
  reader.on('line', function (line) {
    var s = line.split(',').map(e => e.trim());
    if (s < 3) return;
    var path = s.shift();
    var name = s.shift();
    var d = new D(name, path);

    s.forEach(e => {
      if (!storage[e]) storage[e] = [];

      storage[e].push(d);
    });
  });
  reader.on('close', function () {
    sortStorage()
  });

}

function normalizeDirname(dirPath) {
  if (dirPath.startsWith(define.virtualPath)) {
    return dirPath.slice(define.virtualPath.length + 1)
  }
  return dirPath
}

function getStorageKeys() {
  return Object.keys(storage).map(e => {
    return new D(e, define.virtualPath + "/" + e)
  });
}

class VirtualFinder {

  search(dirPath, callback) {
    dirPath = normalizeDirname(dirPath)

    if (!dirPath || dirPath.length == 0) {
      callback(getStorageKeys())
      return;
    }

    var ds = storage[dirPath]
    if (!ds) ds = []
    callback(ds)
  }

}

read();

module.exports = new VirtualFinder();
