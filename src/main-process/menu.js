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
        label: 'Import file tags',
        click: async (m, b, e) => {
          const { dialog } = require('electron')
          dialog.showOpenDialog({ properties: ['openFile'] }).then(result => {
            if (result.canceled) { return; }
            if (result.filePaths.length == 0) { return; }
            const tagFinder = require('./tag_finder.js');
            tagFinder.importFile(result.filePaths[0], () => {
              b.webContents.send("showNotification", { message: "Complete: Import file tags" })
            });
          }).catch(err => {
            console.log(err)
          })
        }
      },
      {
        label: 'Export file tags',
        click: async (m, b, e) => {
          const { dialog } = require('electron')
          dialog.showOpenDialog({ properties: ['openDirectory'] }).then(result => {
            if (result.canceled) { return; }
            if (result.filePaths.length == 0) { return; }
            const tagFinder = require('./tag_finder.js');
            tagFinder.exportFile(result.filePaths[0], () => {
              b.webContents.send("showNotification", { message: "Complete: Export file tags" })
            });
          }).catch(err => {
            console.log(err)
          })
        }
      },
      {
        label: 'Refresh file tags',
        click: async (m, b, e) => {
          const tagFinder = require('./tag_finder.js');
          tagFinder.setUp(() => {
            b.webContents.send("showNotification", { message: "Complete: Refresh file tags" })
          });
        }
      },
    ]
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
