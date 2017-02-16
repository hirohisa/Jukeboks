'use strict'

const storage = require('electron-json-storage');

function getAll(callback) {
  storage.get('storage', function (error, data) {
    if (error || data.length === 0) {
      data = {};
    }

    callback(data);
  });
}

class Storage {

  getShortcuts(callback) {
    getAll((data) => {
      var shortcuts = data['shortcuts'];
      if (!shortcuts) {
        shortcuts = [];
      }
      callback(shortcuts);
    })
  }

  saveShortcut(filePath) {
    getAll((data) => {

      var shortcuts = data['shortcuts'];
      if (!shortcuts) {
        shortcuts = [];
      }
      shortcuts.push(filePath);
      data['shortcuts'] = shortcuts;
      storage.set('storage', data, (error) => {});
    })
  }

}

module.exports = Storage
