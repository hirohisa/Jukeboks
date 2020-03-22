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

  getCurrent() {
    return stack.slice(-1)[0]
  }

  push(d) {
    stack.push(d)
    this.move(d)
  }

  pop() {
    if (stack.length <= 1) return;
    var last = stack.pop();

    this.move(this.getCurrent(), last);
  }

}

module.exports = new Navigator();
