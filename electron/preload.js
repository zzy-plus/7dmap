const {contextBridge, ipcRenderer} = require('electron')
const os = require('os')



contextBridge.exposeInMainWorld('myApi',
    {
        ipc: ipcRenderer
    })