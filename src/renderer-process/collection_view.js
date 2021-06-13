const sy = require('../system');
const ui = require('../ui');
const utils = require('./utils');
const path = require('path');
const queue = require('queue');
const ipc = require('electron').ipcRenderer;
const q = queue();
q.autostart = true;

const mainCollection = document.getElementById('main-collection')
function createItem(d) {
  var element = document.createElement("div");
  element.className = 'grid-item';
  element.appendChild(createText(d.name));
  element.id = d.name;
  element.setAttribute('href', d.path);
  element.addEventListener("click", function (e) {
    var href = e.target.getAttribute('href') || e.target.parentNode.getAttribute('href');
    if (href) {
      var data = { path: href };
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

function render(ds) {
  ds.forEach(function (d) {
    renderToCollection(d);
  });
}

function createImg(path) {
  var img = document.createElement("img");
  img.className = 'grid-item-content';
  img.loading = "lazy"
  img.src = "file://" + path;
  return img;
}

function renderToCollection(d) {
  var element = createItem(d);
  mainCollection.appendChild(element);

  if (d.isDirectory) {
    q.push(
      () => {
        sy.findFiles(d.path, function (ds) {
          if (ds.length == 0) { return }
          if (ds[0].isDirectory) { return }

          element.appendChild(createImg(ds[0].path));
        });
      });
  } else {
    q.push(
      () => {
        element.appendChild(createImg(d.path));
      });
  }
}

ipc.on('keydown', (event, data) => {
  switch (data.code) {
    case "ArrowLeft":
      q.end();
      utils.clean(mainCollection);

      break;
  }
})


ipc.on('selectFile', function (event, data) {
  if (utils.isShowingContent()) { return }
  element = document.getElementById(path.basename(data.filePath));
  if (!element) { return }
  element.scrollIntoView(true);
})

const layoutIcon = document.getElementById('change-layout');
ipc.on('changeLayout', function (event, data) {
  const navigator = require('./navigator')
  var data = {
    d: navigator.getCurrent()
  };
  var isShowingContent = utils.isShowingContent();
  isShowingContent ? utils.showCollection() : utils.showContent();
  layoutIcon.name = isShowingContent ? 'grid-on' : 'crop-original';

  if (isShowingContent) {
    ipc.send('requestFiles', data);
  }
})

ipc.on('responseFiles', function (event, data) {
  q.end();
  utils.clean(mainCollection);
  render(data.ds);
})
