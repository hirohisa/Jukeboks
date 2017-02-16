'use strict'

const _ = require('underscore')
const Storage = require('./storage.js');
const storage = new Storage();

const userDirectoryPath = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];

const directoryContent = document.getElementById('path-directory');
const directoryContentInner = document.getElementById('path-directory-inner');
const directoryLink = document.getElementById('file-directory-link');
const favoriteLink = document.getElementById('favorite-directory-link');
const sideBar = document.getElementById('sidebar');

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
  while (directoryLink.firstChild) {
      directoryLink.removeChild(directoryLink.firstChild)
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
  const fs = require('fs')
  var stats = fs.lstatSync(filePath)

  if (stats.isDirectory()) {
    return "icon-folder"
  }

  return "icon-picture"
}

function findCurrent() {
  var current = document.getElementById('directory-current-page')
  if (current) {
    return current
  }

  current = directoryLink.firstChild
  if (!current) return

  current.id = 'directory-current-page'
  return current
}

function clickFileLink(filePath) {
  const fs = require('fs')
  var stats = fs.lstatSync(filePath)

  if (stats.isDirectory()) {
    jump(filePath)
  }
}

function scrollTo(element) {
  var top = element.getBoundingClientRect().top
  sideBar.scrollTop = top
}

function scrollToRelative(from, to) {
  var fromTop = from.getBoundingClientRect().top
  var toTop = to.getBoundingClientRect().top
  sideBar.scrollTop += toTop - fromTop
}

function appendLink(parent, filePath, referer, click) {
  var link = createLink(filePath, referer)
  link.addEventListener("click", click, false)
  parent.appendChild(link)
}

/////////////

class FileNavigator {

  constructor(transport) {
    this.transport = transport
  }

  // change to select a file
  prefiousSibling() {
    var current = findCurrent()
    if (!current) return
    var previous = current.previousSibling
    if (!previous) return
    this.select(previous)
    scrollToRelative(current, previous)
  }

  nextSibling() {
    var current = findCurrent()
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
    var current = findCurrent()
    if (current) {
      clickFileLink(current.getAttribute('href'))
    }
  }

  moveToTrash() {
    var current = findCurrent();
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
          directoryLink.removeChild(current);

          const ipc = require('electron').ipcRenderer;
          ipc.send('removePath', data);
        }
      });
    }
  }

  select(element) {
    var current = findCurrent()
    if (current) {
      current.id = ''
    }
    element.id = 'directory-current-page'
    this.transport.on({type: 'selectFile', data: element})
  }

  selectRandom() {
    var nodes = []
    var children = directoryLink.childNodes
    for (var i in children) {
      var element = children[i]
      if (element.id != 'directory-current-page') {
        nodes.push(element)
      }
    }
    this.select(_.sample(nodes))
  }

  start() {
    storage.getShortcuts((shortcuts) => {
      for (var i in shortcuts) {
        var filePath = shortcuts[i];

        appendLink(favoriteLink, filePath, "", (e) => {
          this.select(e.target);
          clickFileLink(e.target.getAttribute('href'));
        });
      }
    });
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
          appendLink(directoryLink, filePath, data.referer, (e) => {
            this.select(e.target);
            clickFileLink(e.target.getAttribute('href'));
          })
        }
      );
    }

    q.push(
      () => {
        var current = findCurrent();
        if (current) {
          this.select(current);
          scrollTo(current);
        }
      }
    )
  }

  // storage
  saveShortcut(filePath) {
     storage.saveShortcut(filePath);
  }
}

module.exports = FileNavigator
