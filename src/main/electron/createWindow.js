const { BrowserWindow } = require('electron')
const { win32 } = require('path')
const path = require('path')
function createWindow(config, page) {
  const win = new BrowserWindow({
    ...config,
    show: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.resolve(__dirname, '../', 'models', 'index.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  win.loadFile(path.resolve(__dirname, '../', '../', 'views', page + '.html'))


  return win
}
module.exports = createWindow;
