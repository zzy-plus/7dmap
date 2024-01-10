const sharp = require('sharp');

//获取点信息并封装成一个对象数组
const getPoints = ()=>{

}


//处理xml文件，获取id、name、poi等信息
const parsePrefabs = ()=>{

}

//获取等级信息
const getClass = ()=>{

}


//底图处理
const processImg = async (source, target)=>{

    return new Promise(async (resolve,reject)=>{

        sharp(source + 'biomes.png')
            .composite([{ input: source + 'splat3.png', gravity: 'center' }])
            .toFile(target + 'map.png', (err, info) => {
                if (err) {
                    console.error(err);
                    resolve(1)
                } else {
                    resolve(0)  //在回调中 resolve
                }

            });

    })

}



module.exports = {
    getPoints,
    processImg
}


