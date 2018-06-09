const sy = require('../lib/sy');
const ui = require('../lib/ui');
const utils = require('./utils');
const path = require('path');
const queue = require('queue');
const ipc = require('electron').ipcRenderer;
const q = queue();
q.autostart = true;

const mainCollection = document.getElementById('main-collection')
function createItem(filePath) {
  var fileName = path.basename(filePath);
  var element = document.createElement("div");
  element.className = 'grid-item';
  element.appendChild(createText(fileName));
  element.id = fileName;
  element.setAttribute('href', filePath);
  element.addEventListener("click", function(e) {
    var href = e.target.getAttribute('href');
    if (!href) {
      href = e.target.parentNode.getAttribute('href');
    }
    if (href) {
      var data = {href: href};
      ipc.send('selectCurrent', data);
    }
  }, false);

  return element;
}

function createText(text) {
  var element = document.createElement("div");
  element.className = 'grid-item-label';

  var p = document.createElement("p");
  p.textContent = text;

  element.appendChild(p);
  return element;
}

function render(filePaths) {
  filePaths.forEach(function(filePath) {
    renderToCollection(filePath);
  });
}

function renderToCollection(filePath) {
  var element = createItem(filePath);
  mainCollection.appendChild(element);

  if (sy.isDirectory(filePath)) {
    q.push(
      () => {
        sy.findFiles(filePath, function(filePaths) {
          if (filePaths.length == 0) { return }
          if (sy.isDirectory(filePaths[0])) { return }

          var img = document.createElement("img");
          img.className = 'grid-item-content';;
          img.src = "file://" + filePaths[0];
          element.appendChild(img);
        });
      });
  } else {
    q.push(
      () => {
        var img = document.createElement("img");
        img.className = 'grid-item-content';
        img.src = "file://" + filePath;
        element.appendChild(img);
      });
  }
}

ipc.on('selectFile', function(event, data) {
  if (!utils.isShowingContent()) {
    element = document.getElementById(path.basename(data.filePath));
    if (!element) { return; }
    element.scrollIntoView(true);
  }
})

ipc.on('changeLayoutToContent', function(event, data) {
  q.end();
})

ipc.on('changeLayoutToCollection', function(event, data) {
  var data = {
    path: ui.directoryPath.getAttribute('href')
  };
  ipc.send('requestFiles', data);
})
ipc.on('responseFiles', function(event, data) {
  render(data.files);
})
