'use strict'

const ui = require('../lib/ui')
const ipc = require('electron').ipcRenderer;

function getFilePath() {
  if (ui.getCurrent() != undefined) {
    return ui.getCurrent().getAttribute('href')
  }

  return undefined;
}

function isFocusInputField() {
  return document.activeElement.tagName.toLowerCase() == "input"
}


function execCommands(data) {
  switch (data.code) {
    // Focus Search
    case "KeyF":
      if (isFocusInputField()) {
        ui.searchInputForm.blur();
      } else {
        ui.searchInputForm.focus();
      }
      break;
    // Change layout to grid
    case "KeyG":
      ipc.send('changeLayout', data);
      break;
    default:
  }
}

var previous = undefined
document.addEventListener("keydown", (event) => {
  var data = {
    code: event.code,
    path: ui.directoryPath.getAttribute('href'),
    filePath: getFilePath()
  };

  if (["MetaLeft", "MetaRight"].includes(previous)) {
    execCommands(data);
  }

  if (isFocusInputField()) {
    previous = event.code
    return;
  }

  switch (event.code) {
    case "Backspace":
      ipc.send('moveToTrash', data);
      break;
    default:
  }
  previous = event.code
  ipc.send('keydown', data);
})
