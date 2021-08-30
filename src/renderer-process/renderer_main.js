'use strict'

require('./renderer-process/click_binder.js')
require('./renderer-process/key_binder.js')
require('./renderer-process/file_cursor.js')
require('./renderer-process/content_view.js')
require('./renderer-process/collection_view.js')
require('./renderer-process/notification.js')
// require('./renderer-process/menu.js')

const def = require('./define');
const path = require('path');

// document onload
const navigator = require('./renderer-process/navigator')

function open(data) {
  const sy = require('./system');
  var dir = def.rootPath;
  if (data.argv.length > 1) {
    var a = data.argv[1];
    if (!path.isAbsolute(a)) {
      a = path.join(data.cwd, a);
    }
    dir = a;
    if (!sy.isDirectory(dir)) {
      dir = path.dirname(dir);
    }
  }
  const D = require('./d');
  navigator.push(new D(path.basename(dir), dir));
}
var ipcRenderer = require('electron').ipcRenderer;
ipcRenderer.on('jukeboks-open', function (event, data) {
  open(data);
});