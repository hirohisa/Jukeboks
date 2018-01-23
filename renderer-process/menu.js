'use strict'

const _ = require('underscore');
const remote = require('electron').remote;
const Menu = remote.Menu;
const ui = require('../lib/ui')

var menu = Menu.buildFromTemplate([
  {
    label: 'Show in Finder',
    click: function() {
      const sy = require('../lib/sy');
      var current = ui.getCurrent();
      var href = current.getAttribute('href')
      sy.openDirectory(href);
    }
  },
]);

function isNavigationEvent(event) {
  var result = _.filter(event.path, function(o) {
    return o.id === 'sidebar'
  })

  return result.length > 0;
}

class MenuManager {

  open(event) {

    if (isNavigationEvent(event)) {
      menu.popup(remote.getCurrentWindow());
    }
  }

}

module.exports = new MenuManager()
