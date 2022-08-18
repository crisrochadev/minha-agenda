const { app, BrowserWindow } = require('electron')
const path = require('path')
const createWindow = require('./src/main/electron/createWindow.js')
const createTray = require('./src/main/electron/createTray.js')
require('./src/main/models/main.js')

//Electron reloade
try {
  require('electron-reloader')(module)
} catch (_) { }

function initElectron() {
  const newTaskWindow = createWindow({ width: 480, height: 320 }, 'nova-tarefa')
  // const dashboardPage = createWindow({ width: 1280, height: 720 }, 'painel')
  const allTasks = createWindow({ width: 1280, height: 720 }, 'index')

  let tray = createTray([
    {
      label: "Todas as Tarefas", click: () => {
        if (allTasks.isVisible()) {
          allTasks.hide()
          allTasks.webContents.closeDevTools();
        }
        else {
          allTasks.show()
          allTasks.webContents.openDevTools();
        }
      }
    },
    { label: "Sair", click: () => app.quit() }
  ])
  tray.on('click', () => {

    if (newTaskWindow.isVisible()) {
      newTaskWindow.hide()
      newTaskWindow.webContents.closeDevTools();
    }
    else {
      newTaskWindow.show()
      newTaskWindow.webContents.openDevTools();
    }

  })
}


app.whenReady().then(() => {
  initElectron()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      initElectron()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
