const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

const env = 'dev'

const createWindow = ()=>{
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        backgroundColor: '#ffffff',
        resizable: true,
        //icon: path.resolve(__dirname, '../src/assets/favicon_m.ico'), // 指定图标路径
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
            sandbox: false
        }
    })

    if (env === 'dev') {
        win.loadURL('http://localhost:5173/')
        win.webContents.openDevTools()
    } else {
        win.loadFile('dist/index.html')
        //win.webContents.openDevTools()
    }
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})