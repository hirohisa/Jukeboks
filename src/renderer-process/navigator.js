'use strict';

const ipc = require('electron').ipcRenderer

var stack = [];

class Navigator {

  clear() {
    var r = stack[0]
    stack = [r]
    this.move(r)
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

  push(d, referer = undefined) {
    stack.push(d)
    this.move(d, referer)
  }

  pop() {
    if (stack.length <= 1) return;
    var last = stack.pop();

    this.move(this.getCurrent(), last);
  }

}

module.exports = new Navigator();
