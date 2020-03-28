'use strict'

const ui = require('../ui')
const ipc = require('electron').ipcRenderer;

function getFilePath() {
  if (ui.getCurrent() != undefined) {
    return ui.getCurrent().getAttribute('href')
  }

  return undefined;
}

function isFocusInputField() {
  return document.activeElement.id.toLowerCase() == "search-form-input"
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

var isControlCommandKey = false;
function handleCommand(code, key) {
  var is = ["MetaLeft", "MetaRight"].includes(code);
  if (!is) return;

  isControlCommandKey = key != "up";
}

document.addEventListener("keyup", (event) => {
  handleCommand(event.code, "up");
})

document.addEventListener("keydown", (event) => {
  handleCommand(event.code, "down");
  var data = {
    code: event.code,
    path: ui.dirPath.getAttribute('href'),
    filePath: getFilePath()
  };

  if (isControlCommandKey) {
    execCommands(data);
  }

  if (isFocusInputField()) {
    ipc.send('updateSearchText', data);
    return;
  }

  switch (event.code) {
    case "Backspace":
      ipc.send('moveToTrash', data);
      break;
    default:
      ipc.send('keydown', data);
  }

})
