'use strict'

require('./renderer-process/click_binder')
require('./renderer-process/key_binder')
require('./renderer-process/directory_view.js')
require('./renderer-process/content_view.js')
require('./renderer-process/menu.js')

const def = require('./lib/define');

// document onload
const utils = require('./renderer-process/utils')

function load() {
  utils.jump(def.rootPath)
}
window.onload = load
