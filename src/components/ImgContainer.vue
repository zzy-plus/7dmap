<script setup>
import configs from "@/configs";
import {onMounted, ref, watch} from "vue";

const ipc = myApi.ipc

const imgSrc = ref('src/assets/2.png')

//测试用
onMounted(async ()=>{
  setTimeout(async ()=>{
    const res = await ipc.invoke('event_get_img','West Yubajike Valley')
    console.log(res)
    imgSrc.value = res.data
  },2000)

})


const w = ref(configs.containerWidth)
const h = ref(configs.containerHeight)
const left = ref(0)
const top = ref(0)
const zoomStep = configs.zoomStep
const div1 = ref(null)
const points = ref([])

const down = ref(false)

const onmousemove = (e) => {
  if (down.value) {
    //对拖拽行为的限制
    if (left.value >= configs.containerWidth - 100 && e.movementX > 0) return;
    if (left.value + w.value <= 100 && e.movementX < 0) return;
    if (top.value >= configs.containerWidth - 100 && e.movementY > 0) return;
    if (top.value + h.value <= 100 && e.movementY < 0) return;
    left.value += e.movementX
    top.value += e.movementY
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
  if (e.deltaY < -1) { //滚轮向上
    w.value += zoomStep
    h.value += zoomStep
    left.value -= e.offsetX / w.value * zoomStep
    top.value -= e.offsetY / h.value * zoomStep
  } else if (e.deltaY > 1) { //滚轮向下
    if (h.value <= 400) return    //对缩放行为的限制
    w.value -= zoomStep
    h.value -= zoomStep
    left.value += e.offsetX / w.value * zoomStep
    top.value += e.offsetY / h.value * zoomStep
  }
  //console.log(e)
  for (const index in points.value) {
    points.value[index].x = points.value[index].init_x * w.value/configs.containerWidth
    points.value[index].y = points.value[index].init_y * h.value/configs.containerHeight

  }
}

const onclick = (e) => {

}

watch(w, (new_w) => {

})

onMounted(() => {
  for (let i = 0; i < 200; i++) {
    let x = Math.random() * configs.containerWidth
    let y = Math.random() * configs.containerHeight
    points.value.push({
      id: 'id',
      name: 'name',
      size: 10,
      color: '#5599ff',
      init_x: x,
      init_y: y,
      x: x,
      y: y,
      real_x: 0,
      real_y: 0
    })
  }
})

const onmouseover = (e) => {
  //console.log(e.target)
  console.log(e.target.getAttribute('text'))
}

const onmouseout = (e) => {
  down.value = false
}

</script>

<template>
  <div style=" background-color: #c9c9c9; border: 2px solid black; overflow: hidden; position: relative;"
       :style="{width: configs.containerWidth + 'px', height: configs.containerHeight + 'px'}"
       @mousedown.prevent="onmousedown" @mouseup="onmouseup" @mousemove="onmousemove" @wheel="wheel" @click="onclick"
       @mouseout="onmouseout">


    <img v-bind:src="imgSrc"
         style="object-fit: fill; position: absolute; z-index: 1;"
         :style="{width: w + 'px', height: h + 'px', left: left + 'px', top: top + 'px'}"
    />


    <div ref="div1" style="position: absolute; z-index: 3"
         :style="{width: w+'px', height: h+'px', left: left + 'px', top: top + 'px'}"
    >
      <div
          v-for="(point, index) in points"
          :key="index"
          :style="{position: 'absolute', width: point.size + 'px', height: point.size + 'px',
          backgroundColor: point.color, left: point.x - point.size/2 + 'px', top: point.y - point.size/2 + 'px'}"
          @mouseover="onmouseover"
          text="1230"
      />

    </div>


  </div>

</template>

<style scoped>
canvas {
  border: 1px solid #000; /* 为了演示，添加一个边框 */
}
</style>


