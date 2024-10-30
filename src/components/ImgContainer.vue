<script setup>
import configs from "@/configs"
import {onMounted, ref, watch, computed} from "vue"
import {useDataStore} from "@/stores"
import {storeToRefs} from "pinia";

const ipc = myApi.ipc
let env = 'dev'
let resPath = ''
onMounted(async ()=>{
  env = await ipc.invoke('event_get_env')
  resPath = env === 'dev' ? 'src/res/' : '../../../res/'
})
const dataStore = useDataStore()

const {selectedWorld} = storeToRefs(dataStore)  // 确保不会丢失响应式
watch(selectedWorld, async (newVal) => {  // 初始化的位置
  if (!selectedWorld.value) return
  resetContainer()
  removeMark()
  await getImgAndPoints(newVal)
  canvasLoadImg()
})


const points = ref([])
const mapInfo = ref(undefined)
const loadedWorlds = []
const loadedPointsData = {}
const getImgAndPoints = async (worldPath) => {

  // 获取图片
  const res = await ipc.invoke('event_get_img', worldPath)
  imgSrc.value = res.data.biomes? `data:image/jpeg;base64,${res.data.biomes}`: undefined
  imgSrc2.value = res.data.splat3? `data:image/jpeg;base64,${res.data.splat3}`: undefined

  // 判断这个世界是否请求过
  if (loadedWorlds.includes(worldPath)) {
    points.value = loadedPointsData[worldPath].points
    dataStore.setMapInfo(loadedPointsData[worldPath].mapInfo)
    dataStore.setJsonCSV(loadedPointsData[worldPath].jsonCSV)
  } else {
    const {status, data, msg} = await ipc.invoke('event_get_points', worldPath)
    points.value = data.points
    dataStore.setMapInfo(data.info)
    dataStore.setJsonCSV(data.jsonCSV)
    loadedWorlds.push(worldPath)
    loadedPointsData[worldPath] = {
      points: points.value,
      mapInfo: data.info,
      jsonCSV: data.jsonCSV
    }
  }
  dataStore.setPoints(points.value)
}

const {classOptions} = storeToRefs(dataStore)
const {selections} = storeToRefs(dataStore)
const filter_points = computed(() => {
  const points_filtered = points.value.filter(i => classOptions.value[i.clazz])
  if (!selections.value) {  //筛选关闭
    return points_filtered
  } else {                  //筛选打开
    const points_selected = []
    for (const point of points_filtered) {
      for (const selection of selections.value) {
        if(point.id.includes(selection)){
          points_selected.push(point)
        }else if(point.name.toLowerCase().includes(selection)){
          points_selected.push(point)
        }
      }
    }
    return points_selected
  }
})

const resetContainer = () => {
  w.value = configs.containerWidth
  h.value = configs.containerHeight
  left.value = 0
  top.value = 0
  imgSrc.value = undefined
  imgSrc2.value = undefined
  points.value = []
  imgStyleObj.value = {
    width: `${w.value}px`,
    height: `${h.value}px`,
    left: `${left.value}px`,
    top: `${top.value}px`
  }
}

const imgSrc = ref(undefined)
const imgSrc2 = ref(undefined)

const w = ref(configs.containerWidth)
const h = ref(configs.containerHeight)
const left = ref(0)
const top = ref(0)
const div1 = ref(null)
const down = ref(false)

let move_limited = undefined
let wheel_limited = undefined
const onmousemove = (e) => {
  if (down.value) {
    if (!move_limited) {
      move_limited = setTimeout(() => {
        //对拖拽行为的限制
        if (left.value >= configs.containerWidth - 100 && e.movementX > 0) {
          move_limited = undefined
          return;
        }
        else if (left.value + w.value <= 100 && e.movementX < 0) {
          move_limited = undefined
          return;
        }
        if (top.value >= configs.containerWidth - 100 && e.movementY > 0) {
          move_limited = undefined
          return;
        }
        else if (top.value + h.value <= 100 && e.movementY < 0) {
          move_limited = undefined
          return;
        }
        left.value += e.movementX
        top.value += e.movementY
        imgStyleObj.value = {
          width: `${w.value}px`,
          height: `${h.value}px`,
          left: `${left.value}px`,
          top: `${top.value}px`
        }
        move_limited = undefined
      }, 3)

    }

  }
}

const onmousedown = (e) => {
  //@mousedown.prevent 阻止默认行为
  down.value = true
}

const onmouseup = () => {
  down.value = false
}

const imgStyleObj = ref({
  width: `${w.value}px`,
  height: `${h.value}px`,
  left: `${left.value}px`,
  top: `${top.value}px`
})

const wheel = (e) => {
  if (!wheel_limited) {
    wheel_limited = setTimeout(() => {
      let zoomStep
      if(w.value < 1000){
        zoomStep = configs.zoomStep
      }else {
        zoomStep = 200
      }
      if (e.deltaY < -1) { //滚轮向上
        w.value += zoomStep
        h.value += zoomStep
        left.value -= e.offsetX / w.value * zoomStep
        top.value -= e.offsetY / h.value * zoomStep
      } else if (e.deltaY > 1) { //滚轮向下
        if (h.value > 401) {  //对缩放行为的限制
          w.value -= zoomStep
          h.value -= zoomStep
          left.value += e.offsetX / w.value * zoomStep
          top.value += e.offsetY / h.value * zoomStep
        }
      }
      imgStyleObj.value = {
        width: `${w.value}px`,
        height: `${h.value}px`,
        left: `${left.value}px`,
        top: `${top.value}px`
      }
      wheel_limited = undefined
    }, 50)
  }
}

const computed_points = computed(() => {
  return filter_points.value.map(point => {
    const x = point.init_x * w.value / configs.containerWidth
    const y = point.init_y * h.value / configs.containerHeight
    return {...point, x, y};
  });
});

const onmouseenter = (e) => {
  const cur_id = e.target.getAttribute('text')
  dataStore.setCurId(cur_id)
  const real_x = e.target.getAttribute('real_x')
  const real_y = e.target.getAttribute('real_y')
  const real_z = e.target.getAttribute('real_z')
  dataStore.setCurPos({
    real_x: real_x,
    real_y: real_y,
    real_z: real_z
  })
}

const canvasLoadImg = ()=>{
  let canvas = document.getElementById('img_canvas')
  let ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  let img1 = new Image()
  let img2 = new Image()

  img1.onload = function (){
    ctx.drawImage(img1, 0, 0, canvas.width, canvas.height)
  }
  img2.onload = function (){
    ctx.drawImage(img2, 0, 0, canvas.width, canvas.height)
  }
  img1.src = imgSrc.value
  img2.src = imgSrc2.value
}

const tools = ['边框', '网格']
const checkboxGroup = ref(['网格'])
const gridShow = ref(true)
const change = (arr)=>{
  gridShow.value = arr.includes('网格')
}

const drawGrid = ()=>{
  const canvas = document.getElementById('grid')
  const ctx = canvas.getContext('2d')
  // 获取地图大小
  const size = Number(dataStore.mapInfo.size)
  const center = size / 2
  const scale = canvas.width * 1.0 / size

  for(let offset=0; offset <= center; offset += 1024){
    if(offset === 0){
      // 横向网格
      ctx.strokeStyle = 'rgba(255,39,115,0.93)'
      ctx.beginPath()
      ctx.moveTo(0, center * scale)
      ctx.lineTo(canvas.width, center * scale)
      ctx.stroke()
      //竖向网格
      ctx.beginPath()
      ctx.moveTo(center * scale, 0)
      ctx.lineTo(center * scale, canvas.height)
      ctx.stroke()
    }
    else{
      ctx.strokeStyle = 'rgba(192,218,112,0.59)'
      // 横向网格
      ctx.beginPath()
      ctx.moveTo(0, (center + offset) * scale)
      ctx.lineTo(canvas.width, (center + offset) * scale)
      ctx.moveTo(0, (center - offset) * scale)
      ctx.lineTo(canvas.width, (center - offset) * scale)
      ctx.stroke()
      //竖向网格
      ctx.beginPath()
      ctx.moveTo((center + offset) * scale, 0)
      ctx.lineTo((center + offset) * scale, canvas.height)
      ctx.moveTo((center - offset) * scale, 0)
      ctx.lineTo((center - offset) * scale, canvas.height)
      ctx.stroke()
    }


  }
}

const cleanGrid = ()=>{
  const canvas = document.getElementById('grid')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

watch(computed_points, ()=>{
  cleanGrid()
  setTimeout(()=>{
    drawGrid()
    if(dataStore.mark != null){
      markPoint(dataStore.mark)
    }
  }, 20)
})

// 标记
const {mark} = storeToRefs(dataStore)
watch(mark, (newVal)=>{
  if (newVal === null) return
  markPoint(newVal)
})

const markPoint = (pos)=>{
  const canvas = document.getElementById('mark')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const size = Number(dataStore.mapInfo.size)
  const scale = canvas.width * 1.0 / size
  ctx.strokeStyle = 'rgb(8,255,0)'
  ctx.lineWidth = 5
  // 横向网格
  ctx.beginPath()
  ctx.moveTo(0, pos[1] * scale)
  ctx.lineTo(canvas.width, pos[1] * scale)
  ctx.stroke()
  //竖向网格
  ctx.beginPath()
  ctx.moveTo(pos[0] * scale, 0)
  ctx.lineTo(pos[0] * scale, canvas.height)
  ctx.stroke()
}

const removeMark = ()=>{
  dataStore.setMark(null)
  const canvas = document.getElementById('mark')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}


</script>

<template>
  <div style=" background-color: #c9c9c9; border: 2px solid black; overflow: hidden; position: relative;"
       :style="{width: configs.containerWidth + 'px', height: configs.containerHeight + 'px'}"
       @mousedown.prevent="onmousedown" @mouseup="onmouseup" @mousemove="onmousemove" @wheel="wheel">
    <el-image style="width: 600px; height: 600px" src="https://t.mwm.moe/fj" fit="cover" v-if="!imgSrc"/>

    <canvas id="img_canvas" :width="configs.containerWidth" :height="configs.containerHeight"
        :style="imgStyleObj" style="position: absolute"></canvas>

    <!-- 点 -->
    <div ref="div1" style="position: absolute; z-index: 5"
         :style="imgStyleObj"
    >
      <div
          v-for="(point, index) in computed_points"
          :key="index"
          :style="{position: 'absolute', width: point.size + 'px', height: point.size + 'px', zIndex: point.clazz,
            backgroundColor: point.color, left: point.x - point.size/2 + 'px', top: point.y - point.size/2 + 'px', borderRadius: '50%',
            border: checkboxGroup.includes('边框')?'white 1px solid': '', boxSizing: 'content-box'}"

          @mouseenter="onmouseenter"
          :text="point.id" :real_x="point.real_x" :real_y="point.real_y" :real_z="point.real_z"
      />
    </div>

    <!-- 网格 -->
    <canvas id="grid" :width="w" :height="h"
            :style="{left: `${left}px`, top: `${top}px`}" style="position: absolute; z-index: 2" v-show="gridShow"></canvas>
    <canvas id="mark" :width="w" :height="h"
            :style="{left: `${left}px`, top: `${top}px`}" style="position: absolute; z-index: 3" v-show="gridShow"></canvas>

  </div>

  <!-- 工具栏 -->
  <div style="position:absolute; top: 5px; left: 5px; height: 100px; width: 300px; z-index: 10;">
    <el-checkbox-group v-model="checkboxGroup" size="small" @change="change" fill="#ffc815">
      <el-checkbox-button v-for="item in tools" :label="item">
        {{ item }}
      </el-checkbox-button>
    </el-checkbox-group>
    <el-button size="small" type="success" plain style="margin-top: 3px"
              @click="removeMark">
      清除标记
    </el-button>
  </div>

</template>

<style scoped>
canvas {
  border: 1px solid #000; /* 为了演示，添加一个边框 */
}
</style>


