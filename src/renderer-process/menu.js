'use strict'

const _ = require('underscore');
const remote = require('electron').remote;
const Menu = remote.Menu;
const ui = require('../ui')
const sy = require('../system');

function showInFinder() {
  if (menuManager.event == undefined) return;

  var element = menuManager.event.srcElement;
  var href = element.getAttribute('href')
  sy.showInFinder(href);
}

function onNavigationEvent(event) {
  var result = _.filter(event.path, function (o) {
    return o.id === 'sidebar'
  })

  return result.length > 0;
}

var menu = Menu.buildFromTemplate([
  {
    label: 'Show in Finder',
    click: showInFinder
  },
]);

class MenuManager {

  open(event) {
    this.event = event;
    if (!onNavigationEvent(event)) return;

    menu.popup(remote.getCurrentWindow());
  }
}

const menuManager = new MenuManager()

window.addEventListener('contextmenu', function (e) {
  e.preventDefault();

  menuManager.open(e);
}, false);
