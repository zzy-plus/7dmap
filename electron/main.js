const {app, BrowserWindow, ipcMain, dialog, Menu} = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
const {execSync, exec} = require('child_process')
const {getPoints, processImg} = require('./service/service')


const env = ''
const resPath = env === 'dev'? 'src/res/': '../../../res/'      //前端
const userhome = os.homedir()
const gWorldPath = userhome + '\\AppData\\Roaming\\7DaysToDie\\GeneratedWorlds\\'
const savesLocalPath = userhome + '\\AppData\\Roaming\\7DaysToDie\\SavesLocal'

const mainMenu = Menu.buildFromTemplate([
    {
        label: '🔩选项',
        submenu: [
            {
                label: '关于',
                role: "about"
            },
            {
                label: '退出',
                role: "quit"
            }
        ]
    },
    {
        label: '😳搜索建筑(Ctrl+F)',
        click: ()=> showSearchDlg(),
        accelerator: 'CmdOrCtrl+F'
    }
])

let win
const createWindow = ()=>{
    win = new BrowserWindow({
        width: 908,     //908
        height: 775,
        backgroundColor: '#ffffff',
        resizable: false,
        icon: './assets/7dico.ico',
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
            sandbox: false,
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    if (env === 'dev') {
        win.loadURL('http://localhost:5173/')
        win.webContents.openDevTools()
    } else {
        win.loadFile('dist/index.html')
        //win.webContents.openDevTools()
    }

    Menu.setApplicationMenu(mainMenu)
}

app.whenReady().then(() => {
    createWindow()
})

const showSearchDlg = ()=>{
    win.webContents.send('e_search_dialog','')
}

app.on('window-all-closed', () => {
    app.quit()
})

ipcMain.handle('event_get_worlds', ()=>{

    return new Promise((resolve,reject)=>{
        try {
            const files = fs.readdirSync(gWorldPath)
            const worlds = {}
            for (const file of files) {
                if(file.startsWith('My Level')) continue;
                try {
                    let items = fs.readdirSync(gWorldPath + file)
                    if(items.includes('biomes.png')){
                        worlds[file] = gWorldPath + file
                    }
                }catch (err){continue}
            }
            resolve({status: true, data: worlds, msg:''})
        }catch (err){
            console.log('read worlds files failed: ', err.message)
            resolve({status: false, data: null, msg: '读取世界文件夹失败，请使用手动选择'})
        }
    })
})


ipcMain.handle('event_get_img', (__, worldPath)=>{

    return new Promise(async (resolve,reject)=>{
        try{
            const data = processImg(worldPath)
            resolve({
                status: true,
                data: data,
                msg: ''
            })
        }catch (err){}

    })
})

ipcMain.handle('event_get_points',(__, worldPath)=>{
    return new Promise(async (resolve,reject)=>{

        const data = await getPoints( worldPath, env === 'dev'? 'src/res/': 'res/')
        resolve({status: true, data: data, msg:''})
    })
})

ipcMain.handle('event_save_img',(__, params)=>{

    const {world, points, mapSize} = params
    let worldName, worldPath
    if(world.includes('\\')){
        worldName = world.split('\\').pop() + '_key'
        worldPath = world.replace(/\\/g,'\\\\') + '\\\\'        //!!!!!! 坑 !!!!!!!!
    }else {
        worldName = world
        worldPath = gWorldPath + world + '\\\\'
    }
    const options = {
        title: '另存为',
        defaultPath: worldName + '.png',
        buttonLabel: '保存',
        filters: [{ name: '图片文件', extensions: ['png'] }],
    }
    fs.writeFileSync(`${env === 'dev'? 'src\\res\\': 'res\\'}points.json`, points)

    console.log(worldPath)
    dialog.showSaveDialog(win, options).then((result) => {
        if (!result.canceled) {
            const savePath = result.filePath;
            const command = `ImgProcess \"${worldPath}\" ${env === 'dev'? 'src\\res\\': 'res\\'} \"${savePath}\" ${mapSize}`
            exec(command, (error, stdout, stderr) => {
                if (error || stderr) {
                    console.error(`command erro: ${error.message}`);
                }
            })
        }
    })

})

ipcMain.handle('event_browse_world',()=>{
    return new Promise((resolve,reject)=>{
        dialog.showOpenDialog({
            properties: ['openDirectory'] // 指定对话框打开文件夹
        }).then(result => {
            if (!result.canceled && result.filePaths.length > 0) {
                const selectedPath = result.filePaths[0];
                resolve({status: true, data: selectedPath, msg:''})
            } else {
                resolve({status: true, data: undefined, msg:''})
            }
        }).catch(err => {
            resolve({status: false, data: undefined, msg: '打开路径选择对话框时发生错误'})
        });
    })
})

ipcMain.handle('event_search_data',(__, modelName)=>{

    return new Promise((resolve,reject)=>{


        resolve(0)
    })
})

ipcMain.handle('event_get_server_worlds', ()=>{
    return new Promise((resolve,reject)=>{
        try {
            const files = fs.readdirSync(savesLocalPath)
            const worlds = {}
            for (const file of files) {

                try {
                    let items = fs.readdirSync(savesLocalPath + '\\' + file)
                    if(items.includes('World')){
                        worlds[file] = `${savesLocalPath}\\${file}\\World`
                    }
                }catch (err){continue}
            }
            resolve({status: true, data: worlds, msg:''})
        }catch (err){
            console.log('read worlds files failed: ', err.message)
            resolve({status: false, data: null, msg: '读取世界文件夹失败，请使用手动选择'})
        }
    })
})


