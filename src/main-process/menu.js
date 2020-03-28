const { app, Menu } = require('electron')

function searchVirtualFiles(sender, data, identifer) {
  virtualFinder.search(data.d.path, (ds) => {
    var result = {
      path: data.path,
      ds: ds,
      referer: data.referer
    };
    sender.send(identifer, result);
  })
}


const template = [
  // { role: 'appMenu' }
  ...([{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }]),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: 'Import virtual directory',
        click: async () => {
          const { dialog, ipcMain } = require('electron')
          dialog.showOpenDialog({ properties: ['openFile'] }).then(result => {
            if (result.canceled) { return; }
            if (result.filePaths.length == 0) { return; }
            const virtualFinder = require('./virtual_finder.js');
            virtualFinder.importFile(result.filePaths[0]);
          }).catch(err => {
            console.log(err)
          })
        }
      }
    ]
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
