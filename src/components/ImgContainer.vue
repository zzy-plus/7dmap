<script setup>
import configs from "@/configs"
import {onMounted, ref, watch, computed} from "vue"
import {useDataStore} from "@/stores"
import {storeToRefs} from "pinia";

const ipc = myApi.ipc
const resPath = configs.env === 'dev' ? 'src/res/' : '../../../res/'
const dataStore = useDataStore()
const {selectedWorld} = storeToRefs(dataStore)  //确保不会丢失响应式
watch(selectedWorld, async () => {
  if (!selectedWorld.value) return
  resetContainer()
  await getImgAndPoints('world')

})

const {selectedPath} = storeToRefs(dataStore)
watch(selectedPath, async () => {
  if (!selectedPath.value) return
  resetContainer()
  await getImgAndPoints('path')
})

const points = ref([])
const mapInfo = ref(undefined)
const loadedWorlds = []
const loadedPointsData = {}
const getImgAndPoints = async (flag) => {
  if (flag === 'world') {
    if (loadedWorlds.includes(selectedWorld.value)) {
      imgSrc.value = resPath + 'pngs/' + selectedWorld.value + ' biomes.png'
      imgSrc2.value = resPath + 'pngs/' + selectedWorld.value + ' splat3.png'
      points.value = loadedPointsData[selectedWorld.value].points
      dataStore.setMapInfo(loadedPointsData[selectedWorld.value].mapInfo)
      dataStore.setJsonCSV(loadedPointsData[selectedWorld.value].jsonCSV)
    } else {
      const res = await ipc.invoke('event_get_img', selectedWorld.value)
      imgSrc.value = res.data.biomes
      imgSrc2.value = res.data.splat3
      const {status, data, msg} = await ipc.invoke('event_get_points', selectedWorld.value)
      points.value = data.points
      dataStore.setMapInfo({...data.info, name: selectedWorld.value})
      dataStore.setJsonCSV(data.jsonCSV)
      loadedWorlds.push(selectedWorld.value)
      loadedPointsData[selectedWorld.value] = {
        points: points.value,
        mapInfo: {...data.info, name: selectedWorld.value},
        jsonCSV: data.jsonCSV
      }
    }
    dataStore.setPoints(points.value)
  } else {
    const worldName = selectedPath.value.split('\\').pop()
    const worldKeyName = worldName + '_key'
    if (loadedWorlds.includes(worldKeyName)) {
      imgSrc.value = resPath + 'pngs/' + worldKeyName + ' biomes.png'
      imgSrc2.value = resPath + 'pngs/' + worldKeyName + ' splat3.png'
      points.value = loadedPointsData[worldKeyName].points
      dataStore.setMapInfo(loadedPointsData[worldKeyName].mapInfo)
      dataStore.setJsonCSV(loadedPointsData[worldKeyName].jsonCSV)
    } else {
      const res = await ipc.invoke('event_get_img', selectedPath.value)
      imgSrc.value = res.data.biomes
      imgSrc2.value = res.data.splat3
      const {status, data, msg} = await ipc.invoke('event_get_points', selectedPath.value)
      points.value = data.points
      dataStore.setMapInfo({...data.info, name: worldName})
      dataStore.setJsonCSV(data.jsonCSV)
      loadedWorlds.push(worldKeyName)
      loadedPointsData[worldKeyName] = {
        points: points.value,
        mapInfo: {...data.info, name: worldName},
        jsonCSV: data.jsonCSV
      }
    }
    dataStore.setPoints(points.value)
  }
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
        if(point.id.startsWith(selection)){
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
  imgSrc.value = ''
  imgSrc2.value = ''
  points.value = []
}

const imgSrc = ref('')
const imgSrc2 = ref('')

const w = ref(configs.containerWidth)
const h = ref(configs.containerHeight)
const left = ref(0)
const top = ref(0)
const zoomStep = configs.zoomStep
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

const wheel = (e) => {
  if (!wheel_limited) {
    wheel_limited = setTimeout(() => {
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


</script>

<template>
  <div style=" background-color: #c9c9c9; border: 2px solid black; overflow: hidden; position: relative;"
       :style="{width: configs.containerWidth + 'px', height: configs.containerHeight + 'px'}"
       @mousedown.prevent="onmousedown" @mouseup="onmouseup" @mousemove="onmousemove" @wheel="wheel">
    <el-image style="width: 600px; height: 600px" src="https://t.mwm.moe/fj" fit="cover" v-if="!imgSrc"/>

    <img v-bind:src="imgSrc" v-if="imgSrc"
         style="object-fit: fill; position: absolute; z-index: 1;"
         :style="{width: w + 'px', height: h + 'px', left: left + 'px', top: top + 'px'}"
    />

    <img v-bind:src="imgSrc2" v-if="imgSrc"
         style="object-fit: fill; position: absolute; z-index: 2;"
         :style="{width: w + 'px', height: h + 'px', left: left + 'px', top: top + 'px'}"
    />


    <div ref="div1" style="position: absolute; z-index: 3"
         :style="{width: w+'px', height: h+'px', left: left + 'px', top: top + 'px'}">

      <div
          v-for="(point, index) in computed_points"
          :key="index"
          :style="{position: 'absolute', width: point.size + 'px', height: point.size + 'px', zIndex: point.clazz,
            backgroundColor: point.color, left: point.x - point.size/2 + 'px', top: point.y - point.size/2 + 'px'}"
          @mouseenter="onmouseenter"
          :text="point.id" :real_x="point.real_x" :real_y="point.real_y" :real_z="point.real_z"
      />
    </div>

  </div>

</template>

<style scoped>
canvas {
  border: 1px solid #000; /* 为了演示，添加一个边框 */
}
</style>


