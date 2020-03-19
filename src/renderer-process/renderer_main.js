'use strict'

require('./renderer-process/click_binder.js')
require('./renderer-process/key_binder.js')
require('./renderer-process/file_cursor.js')
require('./renderer-process/content_view.js')
require('./renderer-process/collection_view.js')
require('./renderer-process/notification.js')
require('./renderer-process/menu.js')

const def = require('./define');
const path = require('path');
const D = require('./d');

// document onload
const navigator = require('./renderer-process/navigator')

function load() {
  var d = new D(path.basename(def.rootPath), def.rootPath)
  navigator.push(d);
}
window.onload = load
