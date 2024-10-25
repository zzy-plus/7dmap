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

const {selectedWorld} = storeToRefs(dataStore)  //确保不会丢失响应式
watch(selectedWorld, async (newVal) => {
  if (!selectedWorld.value) return
  resetContainer()
  await getImgAndPoints(newVal)
})


const points = ref([])
const mapInfo = ref(undefined)
const loadedWorlds = []
const loadedPointsData = {}
const getImgAndPoints = async (worldPath) => {

  const res = await ipc.invoke('event_get_img', worldPath)

  imgSrc.value = res.data.biomes? `data:image/jpeg;base64,${res.data.biomes}`: undefined
  imgSrc2.value = res.data.splat3? `data:image/jpeg;base64,${res.data.splat3}`: undefined

  if (loadedWorlds.includes(worldPath)) {

    points.value = loadedPointsData[worldPath].points
    dataStore.setMapInfo(loadedPointsData[worldPath].mapInfo)
    dataStore.setJsonCSV(loadedPointsData[worldPath].jsonCSV)
  } else {

    const {status, data, msg} = await ipc.invoke('event_get_points', worldPath)
    points.value = data.points
    dataStore.setMapInfo({...data.info, name: worldPath})
    dataStore.setJsonCSV(data.jsonCSV)
    loadedWorlds.push(worldPath)
    loadedPointsData[worldPath] = {
      points: points.value,
      mapInfo: {...data.info, name: worldPath},
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


</script>

<template>
  <div style=" background-color: #c9c9c9; border: 2px solid black; overflow: hidden; position: relative;"
       :style="{width: configs.containerWidth + 'px', height: configs.containerHeight + 'px'}"
       @mousedown.prevent="onmousedown" @mouseup="onmouseup" @mousemove="onmousemove" @wheel="wheel">
    <el-image style="width: 600px; height: 600px" src="https://t.mwm.moe/fj" fit="cover" v-if="!imgSrc"/>

    <!-- 图片过大导致的缩放卡顿 -->
<!--    <img v-bind:src="imgSrc" v-if="imgSrc"-->
<!--         style="object-fit: fill; position: absolute; z-index: 1;"-->
<!--         :style="imgStyleObj"-->
<!--    />-->

<!--    <img v-bind:src="imgSrc2" v-if="imgSrc2"-->
<!--         style="object-fit: fill; position: absolute; z-index: 2;"-->
<!--         :style="imgStyleObj"-->
<!--    />-->


    <div ref="div1" style="position: absolute; z-index: 3"
         :style="imgStyleObj"
    >

      <div
          v-for="(point, index) in computed_points"
          :key="index"
          :style="{position: 'absolute', width: point.size + 'px', height: point.size + 'px', zIndex: point.clazz,
            backgroundColor: point.color, left: point.x + 'px', top: point.y - point.size + 'px'}"
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


