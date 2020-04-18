'use strict';

const Database = require('nedb');
const define = require('../define');
const D = require('../d');
const ipc = require('electron').ipcRenderer;

const databasePath = define.rootPath + "/.Jukeboks/virtual_directory.json";
let db = new Database({ filename: databasePath, autoload: true });
db.ensureIndex({ fieldName: 'path', unique: true }, (err) => { });

var storage = {};

function readStream(filePath, callback, completion) {
  const fs = require('fs');
  const stream = fs.createReadStream(filePath);
  const readline = require('readline');
  const reader = readline.createInterface(stream, {});
  var separator = "\t"
  reader.on('line', (line) => {
    var s = line.split(separator).map(e => e.trim());
    if (s < 3) return;
    var path = s.shift();
    var name = s.shift();
    var d = new D(name, path);
    callback(d, s);
  });
  reader.on('close', completion);
}

function writeStream(filePath, docs, completion) {
  const fs = require("fs");

  const stream = fs.createWriteStream(filePath);

  var bufferCount = 0
  var separator = "\t"
  docs.forEach(doc => {
    bufferCount += 1
    stream.write(`${[doc.path, doc.name].concat(doc.terms).join(separator)}\n`)
    if (bufferCount > 20) {
      stream.uncork();
      stream.cork();
      bufferCount = 0;
    }
  })
  stream.end("\n");

  stream.on("error", (err) => {
    if (err)
      console.log(err.message);
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
  }).sort((a, b) => {
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    } else {
      return a.path > b.path ? 1 : -1;
    }
  })
}

class VirtualFinder {

  constructor() {
    this._setup()
  }

  search(dirPath, callback) {
    var dirname = normalizeDirname(dirPath)

    if (!dirname || dirname.length == 0) {
      callback(getStorageKeys())
      return;
    }

    var ds = storage[dirname]
    if (!ds) ds = []
    ds = ds.sort((a, b) => {
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      } else {
        return a.path > b.path ? 1 : -1;
      }
    })
    callback(ds)
  }

  create(d, terms, callback) {
    this._select(d.path, (doc) => {
      var data = {
        name: d.name,
        terms: terms,
      }

      if (doc) {
        this._update(doc.path, data, (replaced) => {
          callback(replaced, true);
        })
        return;
      }

      data.path = d.path
      db.insert(data);
      callback(data, false);
    });
  }

  _update(path, data, callback) {
    db.update({ path: path },
      { $set: data },
      {},
      (err, replaced) => {
        callback(replaced)
      }
    );
  }

  remove(filePath) {
    if (filePath.startsWith(define.virtualPath)) {
      var dirname = normalizeDirname(filePath)
      if (!dirname || dirname.length == 0) { return; }
      this.search(dirname, (ds) => {
        ds.forEach(d => {
          this._select(d.path, (doc) => {
            var data = {
              name: doc.name,
              terms: doc.terms.filter(t => t != dirname),
            }
            this._update(doc.path, data, () => { })
          })
        })
        delete storage[dirname];
      })
      return;
    }

    this._select(filePath, (doc) => {
      if (doc) {
        doc.terms.forEach(e => {
          var array = storage[e].filter(d => d.path != filePath);
          storage[e] = array;
        })
        this._remove(filePath)
      }
    });

  }

  _remove(path) {
    db.remove({ path: path }, {}, (err, numRemoved) => { });
  }

  _setup() {
    this._selectAll(docs => {
      docs.forEach(doc => {
        let d = new D(doc.name, doc.path, true)
        doc.terms.forEach(e => {
          if (!e || e.length == 0) { return; }
          if (!storage[e]) storage[e] = [];
          storage[e].push(d);
        })
      })
    })
  }

  _select(path, callback) {
    db.findOne({ path: path }, (err, doc) => {
      callback(doc);
    });
  }

  _selectAll(callback) {
    db.find({}).sort({ name: -1 }).exec((err, docs) => {
      callback(docs);
    });
  }

  _saveToStorage(d, terms) {
    terms.forEach(e => {
      if (!e || e.length == 0) { return; }
      if (!storage[e]) storage[e] = [];
      var hit = storage[e].filter(_d => _d.path == d.path)
      if (hit.length > 0) { return; }
      storage[e].push(d);
    });
  }

  importFile(filePath, completion) {
    readStream(filePath, (d, terms) => {
      this.create(d, terms, () => {
        this._saveToStorage(d, terms)
      });
    }, completion)
  }

  exportFile(dirPath, completion) {
    var filePath = dirPath + "/" + "virtual_directory.tsv"
    this._selectAll((docs) => {
      writeStream(filePath, docs, completion)
    })
  }

}

module.exports = new VirtualFinder();
