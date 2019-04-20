'use strict';

const Database = require('nedb');
let db = new Database({ filename: '.resource/db.sqlite', autoload: true });
// let db = new Database();

class Bookmarker {

  create(path, callback) {
    this.select(path, function(doc) {
      if (doc == null) {
        var newDoc = {
          path: path,
          createdAt: Date()
        };
        db.insert(newDoc);
        callback(newDoc);
      } else {
        db.update({ path: path},
          { $set: { createdAt: Date() } },
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
