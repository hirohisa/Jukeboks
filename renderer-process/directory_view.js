'use strict'

const sy = require('../lib/sy')
const ui = require('../lib/ui')
const utils = require('./utils.js')
const path = require('path')
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

function appendLink(filePath, referer, click) {
  var link = document.createElement('span')
  link.className = 'nav-group-item'

  link.id = referer == filePath ? 'directory-current-page' : ''

  var klass = sy.isDirectory(filePath) ? "icon-folder" : "icon-picture"
  link.innerHTML = '<span class="icon ' + klass + '"></span>' + path.basename(filePath) + '</span>'

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

  render(data) {
    // TODO: get current directory and validate with data.path

    clear()

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

ipc.on('searchFiles', (event, data) => {
  directoryView.render(data)
})

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
    default:
  }
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
  directoryView.selectRandom()
})
