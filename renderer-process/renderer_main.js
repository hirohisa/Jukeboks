'use strict'

require('./renderer-process/click_binder.js')
require('./renderer-process/key_binder.js')
require('./renderer-process/file_cursor.js')
require('./renderer-process/content_view.js')
require('./renderer-process/collection_view.js')
require('./renderer-process/notification.js')
require('./renderer-process/menu.js')

const def = require('./lib/define');

// document onload
const utils = require('./renderer-process/utils')

function load() {
  utils.jump(def.rootPath)
}
window.onload = load
