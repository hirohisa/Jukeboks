'use strict';

const ipc = require('electron').ipcRenderer
const path = require('path')

var stack = [];

class Navigator {

  clear() {
    var root = stack[0]
    stack = [root]
    this.move(root)
  }

  move(d, referer = undefined) {
    var data = {
      d: d,
      referer: referer
    }

    ipc.send('movePath', data)
  }

  push(d) {
    stack.push(d)
    this.move(d)
  }

  pop() {
    if (stack.length <= 1) return;
    var last = stack.pop();

    var current = stack.slice(-1)[0]
    this.move(current, path.basename(last.path));
  }

}

module.exports = new Navigator();
