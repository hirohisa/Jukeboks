'use strict'

const sy = require('../system')
const ui = require('../ui')
const D = require('../d')
const navigator = require('./navigator')
const path = require('path')
const _ = require('underscore');
const ipc = require('electron').ipcRenderer;
const queue = require('queue');
var q = queue();
q.autostart = true;

function scrollTo(element) {
  if (!element) { return; }
  element.scrollIntoViewIfNeeded();
}

function scrollToRelative(from, to) {
  var fromTop = from.getBoundingClientRect().top
  var toTop = to.getBoundingClientRect().top
  ui.directoryTree.scrollTop += toTop - fromTop
}

function clear() {
  while (ui.directoryTree.firstChild) {
    ui.directoryTree.removeChild(ui.directoryTree.firstChild)
  }
}

function makeLink(d, click) {
  const klass = d.isDirectory ? "icon-folder" : "icon-picture";

  const link = document.createElement("span");
  link.className = "nav-group-item";
  link.addEventListener("click", click, false);
  link.setAttribute("href", d.path);
  link.setAttribute("fileName", d.name);

  const span = document.createElement("span");
  span.className = `icon ${klass}`;
  link.innerHTML = span.outerHTML + d.name;

  return link;
}

function clickFileLink(filePath) {
  if (sy.isDirectory(filePath)) {
    navigator.push(new D(path.basename(filePath), filePath))
  }
}

function filter(term) {
  clear()
  var referer = ui.getCurrent() ? ui.getCurrent().getAttribute('href') : undefined;
  render(dirStorage.ds, referer, term)
}

function reload(data) {
  clear()
  ui.searchInputForm.value = ''

  // TODO: get current directory and validate with data.path

  dirStorage.store(data.ds)
  render(data.ds, data.referer, undefined)
}

function getElementBy(d) {
  var array = Array.from(document.getElementsByClassName('nav-group-item'));

  var result = array.find(e => e.getAttribute('href') == d.path);
  if (result) {
    return result
  }

  return array.find(e => e.getAttribute('fileName') == d.name);
}

function selectCurrent(referer) {
  var current = ui.getCurrent();
  var next = undefined

  if (referer) {
    next = getElementBy(referer);
    if (next) {
      next.id = 'directory-current-page';
      current.id = '';
      current = next
    }
  }

  fileCursor.select(current);
  scrollTo(current);

}

function render(ds, referer, term) {
  if (term) {
    term = term.toLowerCase();
  }

  ds.forEach((d) => {
    if (term && !d.name.toLowerCase().includes(term)) {
      return;
    }

    q.push(

      // Bug: wrong links occur when queue has tasks
      () => {
        var link = makeLink(d, (e) => {
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
  });

  q.push(
    () => {
      selectCurrent(referer);
    }
  )

}

class DirStorage {

  store(ds) {
    this.ds = ds
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
    const data = {
      filePath: element.getAttribute('href')
    }
    ipc.send('selectFile', data)
  }

  previous() {
    const current = ui.getCurrent()
    if (!current) return
    const previous = current.previousSibling
    if (!previous) return
    this.select(previous)
    scrollToRelative(current, previous)
  }

  next() {
    const current = ui.getCurrent()
    if (!current) return
    const next = current.nextSibling
    if (!next) return
    this.select(next)
    scrollToRelative(current, next)
  }

  move() {
    const current = ui.getCurrent()
    if (current) {
      clickFileLink(current.getAttribute('href'))
    }
  }

}

const fileCursor = new FileCursor();
const dirStorage = new DirStorage();

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

ipc.on('updateSearchText', (event, data) => {
  filterIfNeeded();
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
      navigator.pop();
      break;
    case "ArrowRight":
      fileCursor.move()
      break;
    default:
  }
})

ipc.on('click', (event, data) => {
  const def = require('../define');
  switch (data.id) {
    case "navigation-pop":
      navigator.pop();
      break;
    case "move-home-directory":
      navigator.clear();
      break;
    case "show-bookmarks":
      navigator.push(new D(path.basename(def.bookmarksPath), def.bookmarksPath));
      break;
    case "show-tag-directory":
      navigator.push(new D(path.basename(def.tagPath), def.tagPath));
      break;
    case "show-tag-drive":
      navigator.push(new D(path.basename(def.volumesPath), def.volumesPath));
      break;
    case "open-directory":
      var current = navigator.getCurrent();
      sy.revealInFinder(current.path);
      break;
    default:
  }
})

ipc.on('selectCurrent', (event, data) => {
  selectCurrent(data);
});

ipc.on('removePath', function (event, data) {
  var current = ui.getCurrent()
  if (current) {
    fileCursor.next();
    ui.directoryTree.removeChild(current);
  }
})

ipc.on('didMoveDirectory', (event, data) => {
  ui.directoryCurrentDiv.innerHTML = data.d.name ?? path.basename(data.d.path);
})

// ipc.on('updateDirectoryData', (event, data) => {
//   if (ui.dirPath.getAttribute('href') != data.path) { return; }
//   switch (data.id) {
//     case "bookmarkPath":
//       ui.bookmarkDirectoryIcon.name = "bookmark";
//       break;
//     case "unbookmarkPath":
//       ui.bookmarkDirectoryIcon.name = "bookmark-border";
//       break;
//     default:
//   }
// });

ipc.on('endedVideo', (event, data) => {
  fileCursor.next()
  // fileCursor.selectRandom()
})
