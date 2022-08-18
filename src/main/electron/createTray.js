const {Tray,Menu} = require('electron');
const {resolve} = require('path')

function createTray(menu){
  const tray = new Tray(resolve(__dirname,'assets','tray.png'));
  const contextMenu = Menu.buildFromTemplate(menu)
   tray.setToolTip('Minha Agenda')
   tray.setContextMenu(contextMenu)

   return tray
}

module.exports = createTray
