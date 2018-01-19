'use strict'

require('./renderer-process/click_binder')
require('./renderer-process/key_binder')
require('./renderer-process/directory_view.js')

const define = require('./lib/define');

const menu = require('./renderer-process/menu.js')

window.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  menu.open(e);
}, false);

// document onload
const utils = require('./renderer-process/utils')

function load() {
  utils.jump(define.rootPath)
}
window.onload = load
