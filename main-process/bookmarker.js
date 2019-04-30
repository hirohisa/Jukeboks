'use strict';

const Database = require('nedb');
const define = require('../lib/define');

const databasePath = define.rootPath + "/.Jukeboks/bookmarks.json";
let db = new Database({ filename: databasePath, autoload: true });
// let db = new Database();

class Bookmarker {

  create(path, callback) {
    this.select(path, function(doc) {
      if (doc == null) {
        var newDoc = {
          path: path,
          createdAt: Date.now()
        };
        db.insert(newDoc);
        callback(newDoc);
      } else {
        db.update({ path: path},
          { $set: { createdAt: Date.now() } },
          {},
          function(err, replaced) {
            callback(replaced);
          }
        );
      }
    });
  }

  select(path, callback) {
    db.findOne({ path: path }, function (err, doc) {
      callback(doc);
    });
  }

  selectAll(callback) {
    db.find({}).sort({ createdAt: -1 }).exec(function (err, docs) {
      callback(docs);
    });
  }

}

module.exports = new Bookmarker();
