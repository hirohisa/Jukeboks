'use strict'

const sy = require('../lib/sy')
const ui = require('../lib/ui')
const utils = require('./utils.js')
const path = require('path')
const _ = require('underscore');
const ipc = require('electron').ipcRenderer;

function scrollTo(element) {
  var top = element.getBoundingClientRect().top
  ui.sideBar.scrollTop = top
}

function scrollToRelative(from, to) {
  var fromTop = from.getBoundingClientRect().top
  var toTop = to.getBoundingClientRect().top
  ui.sideBar.scrollTop += toTop - fromTop
}

function clear() {
  while (ui.directoryTree.firstChild) {
      ui.directoryTree.removeChild(ui.directoryTree.firstChild)
  }
}

function appendLink(filePath, fileName, referer, click) {
  var link = document.createElement('span')
  link.className = 'nav-group-item'

  link.id = referer == filePath ? 'directory-current-page' : ''

  var klass = sy.isDirectory(filePath) ? "icon-folder" : "icon-picture"
  link.innerHTML = '<span class="icon ' + klass + '"></span>' + fileName + '</span>'

  link.setAttribute('href', path.normalize(filePath))

  link.addEventListener("click", click, false)
  ui.directoryTree.appendChild(link)
}

function clickFileLink(filePath) {
  if (sy.isDirectory(filePath)) {
    utils.jump(filePath)
  }
}

class DirectoryView {

  filter(term) {
    clear()
    var referer = ui.getCurrent() ? ui.getCurrent().getAttribute('href') : undefined;
    this._render(this.files, referer, term)
  }

  render(data) {
    clear()
    ui.searchInputForm.value = ''

    // TODO: get current directory and validate with data.path

    this.files = data.files
    this._render(data.files, data.referer, undefined)
  }

  _render(files, referer, term) {

    const queue = require('queue');
    var q = queue();
    q.autostart = true;

    for (var i in files) {
      var filePath = files[i]
      var fileName = path.basename(filePath)

      if (term && !fileName.includes(term)) {
        continue;
      }

      q.push(

        // Bug: wrong links occur when queue has tasks
        () => {
          appendLink(filePath, fileName, referer, (e) => {
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

  select(element) {
    var current = ui.getCurrent()
    if (current) {
      current.id = ''
    }
    element.id = 'directory-current-page'
    var data = {
      filePath: element.getAttribute('href')
    }
    ipc.send('selectFile', data)
  }

  selectRandom() {
    var nodes = []
    ui.directoryTree.childNodes.forEach(function(e) {
      if (e.id != 'directory-current-page') {
        nodes.push(e)
      }
    })

    this.select(_.sample(nodes))
  }

  previous() {
    var current = ui.getCurrent()
    if (!current) return
    var previous = current.previousSibling
    if (!previous) return
    this.select(previous)
    scrollToRelative(current, previous)
  }

  next() {
    var current = ui.getCurrent()
    if (!current) return
    var next = current.nextSibling
    if (!next) return
    this.select(next)
    scrollToRelative(current, next)
  }

  up() {
    var href = ui.directoryPath.getAttribute("href")
    utils.jump(href + '/..', href)
  }

  down() {
    var current = ui.getCurrent()
    if (current) {
      clickFileLink(current.getAttribute('href'))
    }
  }

}

const directoryView = new DirectoryView();

var previousSearchInputValue = undefined
function filterIfNeeded() {
  if (previousSearchInputValue != ui.searchInputForm.value) {
    directoryView.filter(ui.searchInputForm.value)
  }
  previousSearchInputValue = ui.searchInputForm.value
}

ipc.on('searchFiles', (event, data) => {
  directoryView.render(data)
})

var previousKey = undefined
ipc.on('keydown', (event, data) => {
  switch (data.code) {
    case "ArrowUp":
    directoryView.previous()
      break;
    case "ArrowDown":
    directoryView.next()
      break;
    case "ArrowLeft":
    directoryView.up()
      break;
    case "ArrowRight":
    directoryView.down()
      break;
    case "Backspace":
    if (document.activeElement.tagName.toLowerCase() != "input") {
      ipc.send('moveToTrash', data);
    }
      break;
    case "KeyS":
    if (["MetaLeft", "MetaRight"].includes(previousKey)) {
      ui.searchInputForm.focus();
    }
      break;
    default:
  }
  previousKey = data.code

  filterIfNeeded();
})

ipc.on('click', (event, data) => {
  switch (data.id) {
    case "move-parent-directory":
    directoryView.up()
      break;
    default:
  }
})

ipc.on('removePath', function(event, data) {

  var current = ui.getCurrent()
  if (current) {
    directoryView.next();
    ui.directoryTree.removeChild(current);
  }

})

ipc.on('didMoveDirectory', (event, data) => {
  const path = require('path')
  ui.directoryPath.innerHTML = path.basename(data.path)
  ui.directoryPath.setAttribute('href', data.path)
})

ipc.on('endedVideo', (event, data) => {
  directoryView.next()
  // directoryView.selectRandom()
})
