'use strict'

const _ = require('underscore')
const sy = require('../lib/sy')
const ui = require('../lib/ui')

const userDirectoryPath = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];

function jump(directoryPath, referer = undefined) {
  const path = require('path')
  directoryPath = path.normalize(directoryPath)
  directoryContent.setAttribute('href', directoryPath)
  directoryContentInner.innerHTML = path.basename(directoryPath)

  var data = {
    path: directoryPath,
    referer: referer
  }

  const ipc = require('electron').ipcRenderer
  ipc.send('inputPath', data)
}

function createElement(type, id, className, innerHTML = "") {
  var element = document.createElement(type)
  if (id) element.id = id
  if (className) element.className = className
  element.innerHTML = innerHTML
  return element
}

function clearContent() {
  while (ui.directoryTree.firstChild) {
      ui.directoryTree.removeChild(ui.directoryTree.firstChild)
  }
}

function createLink(filePath, referer) {
  const path = require('path')

  var file = path.basename(filePath)
  var id = referer === file ? 'directory-current-page' : ''
  var innerHTML = '<span class="icon ' + ensureIconName(filePath) + '"></span>' + file + '</span>'
  var link = createElement('span', id, 'nav-group-item', innerHTML)
  link.setAttribute('href', path.normalize(filePath))
  return link
}

function ensureIconName(filePath) {
  if (sy.isDirectory(filePath)) {
    return "icon-folder"
  }

  return "icon-picture"
}

function clickFileLink(filePath) {
  if (sy.isDirectory(filePath)) {
    jump(filePath)
  }
}

function scrollTo(element) {
  var top = element.getBoundingClientRect().top
  ui.sideBar.scrollTop = top
}

function scrollToRelative(from, to) {
  var fromTop = from.getBoundingClientRect().top
  var toTop = to.getBoundingClientRect().top
  ui.sideBar.scrollTop += toTop - fromTop
}

function appendLink(filePath, referer, click) {
  var link = createLink(filePath, referer)
  link.addEventListener("click", click, false)
  ui.directoryTree.appendChild(link)
}

/////////////

class FileNavigator {

  constructor(transport) {
    this.transport = transport
  }

  // change to select a file
  prefiousSibling() {
    var current = ui.getCurrent()
    if (!current) return
    var previous = current.previousSibling
    if (!previous) return
    this.select(previous)
    scrollToRelative(current, previous)
  }

  nextSibling() {
    var current = ui.getCurrent()
    if (!current) return
    var next = current.nextSibling
    if (!next) return
    this.select(next)
    scrollToRelative(current, next)
  }

  upDirectory() {
    var href = directoryContent.getAttribute("href")
    jump(href + '/..', directoryContentInner.innerHTML)
  }

  downDirectory() {
    var current = ui.getCurrent()
    if (current) {
      clickFileLink(current.getAttribute('href'))
    }
  }

  moveToTrash() {
    var current = ui.getCurrent();
    if (current) {
      var filePath = current.getAttribute('href');
      const path = require('path');
      const fs = require('fs');
      var trashPath = userDirectoryPath + "/.Trash/" + path.basename(filePath);
      var self = this;
      fs.rename(filePath, trashPath, (e) => {
        if (!e) {
          var data = {
            path: filePath
          };

          this.nextSibling();
          ui.directoryTree.removeChild(current);

          const ipc = require('electron').ipcRenderer;
          ipc.send('removePath', data);
        }
      });
    }
  }

  select(element) {
    var current = ui.getCurrent()
    if (current) {
      current.id = ''
    }
    element.id = 'directory-current-page'
    this.transport.on({type: 'selectFile', data: element})
  }

  selectRandom() {
    var nodes = []
    var children = ui.directoryTree.childNodes
    for (var i in children) {
      var element = children[i]
      if (element.id != 'directory-current-page') {
        nodes.push(element)
      }
    }
    this.select(_.sample(nodes))
  }

  start() {
    jump(userDirectoryPath)
  }

  clear() {
    clearContent()
  }

  render(data) {
    const queue = require('queue');
    var q = queue();
    q.autostart = true;

    for (var i in data.files) {
      var filePath = data.files[i]

      q.push(

        // Bug: wrong links occur when queue has tasks
        () => {
          appendLink(filePath, data.referer, (e) => {
            this.select(e.target);
            clickFileLink(e.target.getAttribute('href'));
          })
        }
      );
    }

    q.push(
      () => {
        var current = ui.getCurrent();
        if (current) {
          this.select(current);
          scrollTo(current);
        }
      }
    )
  }
}

module.exports = FileNavigator
