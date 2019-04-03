'use strict'

const sy = require('../lib/system')
const ui = require('../lib/ui')
const utils = require('./utils.js')
const path = require('path')
const _ = require('underscore');
const ipc = require('electron').ipcRenderer;

function scrollTo(element) {
  if (!element) { return; }
  element.scrollIntoViewIfNeeded();
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

function makeLink(filePath, fileName, click) {
  var klass = sy.isDirectory(filePath) ? "icon-folder" : "icon-picture"

  var html = `
  <span class="nav-group-item" id="" href="${path.normalize(filePath)}">
    <span class="icon ${klass}"></span>${fileName}</span>
  </span>
  `;

  var link = ui.createElementFromHTML(html);
  link.addEventListener("click", click, false);
  return link;
}

function clickFileLink(filePath) {
  if (sy.isDirectory(filePath)) {
    utils.jump(filePath)
  }
}

function filter(term) {
  clear()
  var referer = ui.getCurrent() ? ui.getCurrent().getAttribute('href') : undefined;
  render(fileStorage.files, referer, term, ui.searchInputForm)
}

function reload(data) {
  clear()
  ui.searchInputForm.value = ''

  // TODO: get current directory and validate with data.path

  fileStorage.store(data.files)
  render(data.files, data.referer, undefined, undefined)
}

function getElementBy(href) {
  var array = Array.from(document.getElementsByClassName('nav-group-item'));
  return array.find(e => e.getAttribute('href') == href);
}

function selectCurrent(href, focusTarget) {
  var current = undefined;
  if (href) {
    current = getElementBy(href);
    if (current) {
      current.id = 'directory-current-page';
    }
  }
  if (!current) {
    current = ui.getCurrent();
  }

  fileCursor.select(current);
  if (!focusTarget) {
    focusTarget = current;
  }
  scrollTo(focusTarget);

}

function render(files, referer, term, focusTarget) {
  const queue = require('queue');
  var q = queue();
  q.autostart = true;

  for (var i in files) {
    var filePath = files[i]
    var fileName = path.basename(filePath).normalize()

    if (term && !fileName.includes(term)) {
      continue;
    }

    q.push(

      // Bug: wrong links occur when queue has tasks
      () => {
        var link = makeLink(filePath, fileName, (e) => {
          var target = e.target;
          if (e.target.className != "nav-group-item") {
            target = target.parentNode;
          }
          fileCursor.select(target);
          clickFileLink(target.getAttribute('href'));
        })

        ui.directoryTree.appendChild(link);
      }
    );
  }

  q.push(
    () => {
      selectCurrent(referer, focusTarget);
    }
  )

}

class FileStorage {

  store(files) {
    this.files = files
  }

}

class FileCursor {

  select(element) {
    if (!element) { return; }

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

const fileCursor = new FileCursor();
const fileStorage = new FileStorage();

var previousSearchInputValue = undefined
function filterIfNeeded() {
  if (previousSearchInputValue != ui.searchInputForm.value) {
    filter(ui.searchInputForm.value)
  }
  previousSearchInputValue = ui.searchInputForm.value
}

ipc.on('searchFiles', (event, data) => {
  reload(data)
})

ipc.on('keydown', (event, data) => {
  switch (data.code) {
    case "ArrowUp":
      fileCursor.previous()
      break;
    case "ArrowDown":
      fileCursor.next()
      break;
    case "ArrowLeft":
      fileCursor.up()
      break;
    case "ArrowRight":
      fileCursor.down()
      break;
    default:
  }

  filterIfNeeded();
})

ipc.on('click', (event, data) => {
  switch (data.id) {
    case "move-parent-directory":
      fileCursor.up()
    break;
    case "move-home-directory":
      const def = require('../lib/define');
      utils.jump(def.rootPath)
    break;
    default:
  }
})

ipc.on('selectCurrent', (event, data) => {
  selectCurrent(data.href, undefined);
});

ipc.on('removePath', function(event, data) {

  var current = ui.getCurrent()
  if (current) {
    fileCursor.next();
    ui.directoryTree.removeChild(current);
  }

})

ipc.on('didMoveDirectory', (event, data) => {
  const path = require('path')
  ui.directoryPath.innerHTML = '<span class="icon icon-star-empty"></span>' + path.basename(data.path);
  ui.directoryPath.setAttribute('href', data.path);
})

ipc.on('endedVideo', (event, data) => {
  fileCursor.next()
  // fileCursor.selectRandom()
})
