'use strict';

const Database = require('nedb');
const define = require('../define');
const D = require('../d');
const fileUtils = require('../file_utils')

const databasePath = define.rootPath + "/.Jukeboks/tags.json";
let db = new Database({ filename: databasePath, autoload: true });
db.ensureIndex({ fieldName: 'path', unique: true }, (err) => { });

var storage = {};
var _storageKeys = undefined;

function setUpStorage() {
  storage = {};
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

function strip(str) {
  str = str.replace(/\s/g, '')
  return str.toLowerCase()
}

function sort(ds) {
  return ds.sort((a, b) => {
    var result = fileUtils.sortNumerically(a.name, b.name);
    if (result != 0) {
      return result;
    }

    return fileUtils.sortNumerically(a.path, b.path);
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

function getAllTags() {
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
    if (dirPath == define.tagPath) {
      callback(getAllTags())
      return;
    }

    var tag = getTagNameFrom(dirPath)

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
      this._removeTag(getTagNameFrom(filePath))
      return;
    }

    this._removeDoc(filePath);
  }

  _removeTag(tagName) {
    if (!tagName || tagName.length == 0) { return; }

    this.search(tagName, (ds) => {
      ds.forEach(d => {
        this._select(d.path, (doc) => {
          var data = {
            name: doc.name,
            terms: doc.terms.filter(t => t != tagName),
          }
          this._update(doc.path, data, () => { })
        })
      })
      delete storage[tagName];
    })
  }

  _removeDoc(filePath) {
    this._select(filePath, (doc) => {
      if (doc) {
        doc.terms.forEach(e => {
          var array = storage[e].filter(d => d.path != filePath);
          storage[e] = array;
        })
        db.remove({ path: filePath }, {}, (err, numRemoved) => { });
      }
    });

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

  organize(completion) {
    const queue = require('queue');
    const q = queue();
    q.autostart = true;
    var taskCount = 0;
    var finishedCount = 0;

    var self = this;
    var keyStorage = {};

    self.setUp(() => {
      var ds = getAllTags();
      ds.forEach(d => {
        var key = strip(d.name)
        if (!keyStorage[key]) keyStorage[key] = [];
        keyStorage[key].push(d)
      })

      var keys = Object.keys(keyStorage).filter(key => {
        return keyStorage[key].length > 1;
      });

      keys.forEach(function (key) {
        var first = undefined;
        keyStorage[key].forEach(d => {
          if (first) {
            self.search(d.path, ds => {
              ds.forEach(_d => {
                self._select(_d.path, doc => {
                  q.push(() => {
                    taskCount += 1;
                    var data = {
                      name: doc.name,
                      terms: doc.terms.filter(t => t != d.name).concat([first]),
                    }
                    self._update(doc.path, data, () => {
                      finishedCount += 1;
                      if (finishedCount >= taskCount) {
                        completion();
                      }
                    })
                  })
                })
              })
            })
          }

          if (!first) first = d.name;
        })
      });
    })
  }

}

module.exports = new TagFinder();
