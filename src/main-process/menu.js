const { app, Menu } = require('electron')

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
        click: async (m, b, e) => {
          const { dialog } = require('electron')
          dialog.showOpenDialog({ properties: ['openFile'] }).then(result => {
            if (result.canceled) { return; }
            if (result.filePaths.length == 0) { return; }
            const virtualFinder = require('./virtual_finder.js');
            virtualFinder.importFile(result.filePaths[0], () => {
              b.webContents.send("showNotification", { message: "Complete: Import virtual directory" })
            });
          }).catch(err => {
            console.log(err)
          })
        }
      },
      {
        label: 'Export virtual directory',
        click: async (m, b, e) => {
          const { dialog } = require('electron')
          dialog.showOpenDialog({ properties: ['openDirectory'] }).then(result => {
            if (result.canceled) { return; }
            if (result.filePaths.length == 0) { return; }
            const virtualFinder = require('./virtual_finder.js');
            virtualFinder.exportFile(result.filePaths[0], () => {
              b.webContents.send("showNotification", { message: "Complete: Export virtual directory" })
            });
          }).catch(err => {
            console.log(err)
          })
        }
      },
    ]
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
