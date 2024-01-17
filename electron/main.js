const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
const {execSync, exec} = require('child_process')
const {getPoints, processImg} = require('./service/service')


const env = ''
const resPath = env === 'dev'? 'src/res/': '../../../res/'      //前端
const userhome = os.homedir()
const gWorldPath = userhome + '\\AppData\\Roaming\\7DaysToDie\\GeneratedWorlds\\'

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

ipcMain.handle('event_get_worlds', ()=>{

    return new Promise((resolve,reject)=>{
        try {
            const files = fs.readdirSync(gWorldPath)
            const worlds = []
            for (const file of files) {
                if(file.startsWith('My Level')) continue;
                try {
                    let items = fs.readdirSync(gWorldPath + file)
                    if(items.includes('biomes.png')){
                        worlds.push(file)
                    }
                }catch (err){continue}
            }
            resolve({status: true, data: worlds, msg:''})
        }catch (err){
            console.log('read worlds files failed: ', err.message)
            resolve({status: false, data: null, msg: '读取世界文件夹失败'})
        }
    })
})


ipcMain.handle('event_get_img', (__, world)=>{

    return new Promise(async (resolve,reject)=>{
        try{
            const worldPath = gWorldPath + world + '\\'
            const targetPath = env === 'dev'? 'src/res/pngs/': 'res/pngs/'
            await processImg(worldPath, targetPath, world)
            resolve({
                status: true,
                data: {
                    biomes: resPath + 'pngs/' + world + ' biomes.png',
                    splat3: resPath + 'pngs/' + world + ' splat3.png'
                },
                msg: ''
            })
        }catch (err){}

    })
})

ipcMain.handle('event_get_points',(__, world)=>{
    return new Promise(async (resolve,reject)=>{
        const worldPath = gWorldPath + world + '\\'
        const data = await getPoints( worldPath, env === 'dev'? 'src/res/': 'res/')
        resolve({status: true, data: data, msg:''})
    })
})

ipcMain.handle('event_save_img',(__, params)=>{

    const {world, points, mapSize} = params
    const options = {
        title: '另存为',
        defaultPath: world + '.png',
        buttonLabel: '保存',
        filters: [{ name: '图片文件', extensions: ['png'] }],
    }
    fs.writeFileSync(`${env === 'dev'? 'src\\res\\': 'res\\'}points.json`, points)

    dialog.showSaveDialog(win, options).then((result) => {
        if (!result.canceled) {
            const savePath = result.filePath;
            const command = `ImgProcess \"${world}\" ${env === 'dev'? 'src\\res\\': 'res\\'} \"${savePath}\" ${mapSize}`
            exec(command, (error, stdout, stderr) => {
                if (error || stderr) {
                    console.error(`command erro: ${error.message}`);
                }
            })
        }
    })

})


