const {contextBridge, ipcRenderer} = require('electron')
const os = require('os')



contextBridge.exposeInMainWorld('myApi',
    {
        ipc: ipcRenderer,
        ipcListen: (event_name, callback)=> ipcRenderer.on(event_name, callback),
        generatedWorldPath: os.homedir() + '\\AppData\\Roaming\\7DaysToDie\\GeneratedWorlds\\',
        savesLocalPath: os.homedir() + '\\AppData\\Roaming\\7DaysToDie\\SavesLocal'
    })