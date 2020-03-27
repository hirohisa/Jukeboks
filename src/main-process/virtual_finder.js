'use strict';

const Database = require('nedb');
const define = require('../define');
const D = require('../d');

const databasePath = define.rootPath + "/.Jukeboks/virtual_directory.json";
let db = new Database({ filename: databasePath, autoload: true });
db.ensureIndex({ fieldName: 'path', unique: true }, function (err) { });

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

function stream(filePath, callback, completion) {
  const fs = require('fs');
  const readStream = fs.createReadStream(filePath);
  const readline = require('readline');
  const reader = readline.createInterface(readStream, {});
  reader.on('line', function (line) {
    var s = line.split(',').map(e => e.trim());
    if (s < 3) return;
    var path = s.shift();
    var name = s.shift();
    var d = new D(name, path);
    callback(d, s);
  });
  reader.on('close', completion);
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

  constructor() {
    this._setup()
  }

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

  create(d, terms, callback) {
    this._select(d.path, function (doc) {
      var data = {
        name: d.name,
        terms: terms,
      }

      if (doc) {
        db.update({ path: d.path },
          { $set: data },
          {},
          function (err, replaced) {
            callback(replaced, true);
          }
        );
        return;
      }

      data.path = d.path
      db.insert(data);
      callback(data, false);
    });
  }

  _setup() {
    this._selectAll(docs => {
      docs.forEach(doc => {
        let d = new D(doc.name, doc.path, true)
        doc.terms.forEach(e => {
          if (!storage[e]) storage[e] = [];
          storage[e].push(d);
        })
      })
    })
  }

  _select(path, callback) {
    db.findOne({ path: path }, function (err, doc) {
      callback(doc);
    });
  }

  _selectAll(callback) {
    db.find({}).exec(function (err, docs) {
      callback(docs);
    });
  }

  _saveToStorage(d, terms) {
    terms.forEach(e => {
      if (!storage[e]) storage[e] = [];
      storage[e].push(d);
    });
  }

  importFile(filePath) {
    stream(filePath, (d, terms) => {
      this.create(d, terms, () => {
        this._saveToStorage(d, terms)
      });
    }, () => { sortStorage() })
  }

}

module.exports = new VirtualFinder();
