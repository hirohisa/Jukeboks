'use strict';

const Database = require('nedb');
const define = require('../define');
const D = require('../d');

const databasePath = define.rootPath + "/.Jukeboks/tags.json";
let db = new Database({ filename: databasePath, autoload: true });
db.ensureIndex({ fieldName: 'path', unique: true }, (err) => { });

var storage = {};
var _storageKeyMap = {};
var _storageKeys = undefined;

function setUpStorage() {
  storage = {};
  _storageKeyMap = {};
  _storageKeys = undefined;
}

function saveToStorage(d, terms) {
  terms.forEach(e => {
    if (!e || e.length == 0) { return; }
    if (!storage[e]) storage[e] = [];
    var hit = storage[e].filter(_d => _d.path == d.path)
    if (hit.length > 0) { return; }
    storage[e].push(d);
  });
}

function sort(ds) {
  return ds.sort((a, b) => {
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    } else {
      return a.path > b.path ? 1 : -1;
    }
  })
}

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
  stream.on("close", completion)
  stream.on("error", (err) => {
    if (err)
      console.log(err.message);
  });
}

function getTagNameFrom(dirPath) {
  if (dirPath.startsWith(define.tagPath)) {
    return dirPath.slice(define.tagPath.length + 1)
  }
  return dirPath
}

function getStorageKeys() {
  if (_storageKeys) {
    return _storageKeys;
  }

  _storageKeys = sort(Object.keys(storage).map(e => new D(e, define.tagPath + "/" + e)))
  return _storageKeys;
}

class TagFinder {

  constructor() {
    this.setUp(() => { })
  }

  search(dirPath, callback) {
    var tag = getTagNameFrom(dirPath)

    if (!tag || tag.length == 0) {
      callback(getStorageKeys())
      return;
    }

    var ds = storage[tag]
    if (!ds) ds = []
    callback(sort(ds))
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
    if (filePath.startsWith(define.tagPath)) {
      var dirname = getTagNameFrom(filePath)
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

  setUp(callback) {
    setUpStorage();
    this._selectAll(docs => {
      docs.forEach(doc => {
        let d = new D(doc.name, doc.path, true)
        saveToStorage(d, doc.terms)
      })
      callback();
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

  importFile(filePath, completion) {
    var readCount = 0;
    var writeCount = 0;
    readStream(filePath, (d, terms) => {
      readCount += 1;
      this.create(d, terms, () => {
        saveToStorage(d, terms)
        writeCount += 1;
        if (writeCount == readCount) {
          completion();
        }
      });
    }, () => { })
  }

  exportFile(dirPath, completion) {
    var filePath = dirPath + "/" + "master.tsv"
    this._selectAll((docs) => {
      writeStream(filePath, docs, completion)
    })
  }

}

module.exports = new TagFinder();
