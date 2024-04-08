const fs = require('fs')
const {parse} = require("csv-parse")
const xmljs = require('xml-js')


const containerSize = 600
const colors = {
    '5': '#b431f8',
    '4': '#ff0b0b',
    '3': '#ecc70c',
    '2': '#4426fc',
    '1': '#4bea41',
    '0': '#a1a1a1',
}
const sizes = {
    '5': 9,
    '4': 7,
    '3': 6,
    '2': 5,
    '1': 5,
    '0': 5
}

//获取点信息并封装成一个对象数组
const getPoints = async (xmlPath, resPath) => {

    const {models, mapInfo} = parseXmlFiles(xmlPath)

    const jsonCSV = await parseCSV(resPath)

    //封装
    const points = []
    for (const item of models) {
        const id = item._attributes.name
        if (!jsonCSV.hasOwnProperty(id)) continue;
        const position = item._attributes.position.split(',')
        const real_x = Number(position[0])
        const real_y = Number(position[2])
        const real_z = Number(position[1])
        const init_x = (real_x + mapInfo.size / 2) / mapInfo.size * containerSize
        const init_y = (mapInfo.size / 2 - real_y) / mapInfo.size * containerSize
        const x = init_x
        const y = init_y
        const name = jsonCSV[id].name
        const cname = jsonCSV[id].cname
        let clazz, size, color
        if (id.startsWith('trader_')) {
            clazz = '6'
            size = 10
            color = '#1cffe4'
        } else {
            clazz = jsonCSV[id].clazz
            size = sizes[clazz]
            color = colors[clazz]
        }

        points.push({
            id: id,
            name: name,
            cname: cname,
            clazz: clazz,
            size: size,
            color: color,
            init_x: init_x,
            init_y: init_y,
            x: x,
            y: y,
            real_x: real_x,
            real_y: real_y,
            real_z: real_z
        })
    }
    return {info: mapInfo, points: points, jsonCSV: jsonCSV}
}

//处理CSV
const parseCSV = (resPath) => {
    return new Promise((resolve, reject) => {
        //解析csv文件
        const jsonCSV = {}
        fs.createReadStream(resPath + '7days_models_info.csv')
            .pipe(parse({delimiter: ","}))
            .on("data", function (row) {
                jsonCSV[row[0]] = {clazz: row[1], name: row[2], cname: row[3]}
            }).on('end', () => {
            resolve(jsonCSV)
        })
    })
}

//处理xml文件，获取id、name、poi等信息
const parseXmlFiles = (xmlPath) => {

    const xmlPrefabs = fs.readFileSync(xmlPath + '\\prefabs.xml', 'utf-8')
    const jsonPrefabs = JSON.parse(xmljs.xml2json(xmlPrefabs, {compact: true}))
    const decorations = jsonPrefabs.prefabs.decoration
    /*
      [{
        _attributes: {
          type: 'model',
          name: 'trader_rekt',
          position: '2293,34,-1838',
          rotation: '3'
        }
      },...]
    */
    const xmlMapInfo = fs.readFileSync(xmlPath + '\\map_info.xml', 'utf-8')
    const jsonMapInfo = JSON.parse(xmljs.xml2json(xmlMapInfo, {compact: true}))
    const properties = jsonMapInfo.MapInfo.property
    const mapInfo = {}
    for (const property of properties) {
        if (property._attributes.name === 'HeightMapSize') {
            mapInfo['size'] = Number(property._attributes.value.split(',')[0])
        } else if (property._attributes.name === 'GameVersion') {
            mapInfo['version'] = property._attributes.value
        } else if (property._attributes.name === 'Generation.Seed') {
            mapInfo['seed'] = property._attributes.value
        }
    }
    return {models: decorations, mapInfo: mapInfo}
}

//底图处理
const processImg = (source) => {

    const file1 = fs.readFileSync(source + 'biomes.png')
    const file2 = fs.readFileSync(source + 'splat3.png')

    return {
        biomes: Buffer.from(file1).toString('base64'),
        splat3: Buffer.from(file2).toString('base64')
    }
}

module.exports = {
    getPoints,
    processImg
}


