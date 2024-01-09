<script setup>
import configs from "@/configs";
import {onMounted, ref, watch} from "vue";

const img = ref(null)
const canvas = ref(null)

const w = ref(configs.containerWidth)
const h = ref(configs.containerHeight)
const left = ref(0)
const top = ref(0)
const zoomStep = configs.zoomStep
const div1 = ref(null)
const children = ref([])


const down = ref(false)

const arrX = []
const arrY = []

const onmousemove = (e)=>{
  if(down.value){
    //对拖拽行为的限制
    if(left.value>= configs.containerWidth -100 && e.movementX>0 ) return;
    if(left.value + w.value <= 100 && e.movementX<0) return;
    if(top.value>= configs.containerWidth -100 && e.movementY>0 ) return;
    if(top.value + h.value <= 100 && e.movementY<0) return;
    left.value += e.movementX
    top.value += e.movementY
  }
}

const onmousedown = (e)=>{
  //@mousedown.prevent 阻止默认行为
  down.value = true
}

const onmouseup = ()=>{
  down.value = false
}

const wheel = (e)=>{
  if(e.deltaY < -1){ //滚轮向上
    w.value += zoomStep
    h.value += zoomStep
    left.value -= e.offsetX/w.value * zoomStep
    top.value -= e.offsetY/h.value * zoomStep
  }else if(e.deltaY > 1){ //滚轮向下
    if(h.value<=400) return    //对缩放行为的限制
    w.value -= zoomStep
    h.value -= zoomStep
    left.value += e.offsetX/w.value * zoomStep
    top.value += e.offsetY/h.value * zoomStep
  }
  //console.log(e)
  for (const index in children.value) {
    children.value[index].style.left = `${arrX[index]*w.value/400}px`

    children.value[index].style.top = `${arrY[index]*h.value/400}px`

  }
}

const onclick = (e)=>{

}

watch(w,(new_w)=>{


})


onMounted(()=>{
  for (let i = 0; i < 50; i++) {
    arrX.push(Math.random()*400)
    arrY.push(Math.random()*400)
  }
  for (let i = 0; i < 50; i++) {
    children.value.push({style:{
        width: '10px',
        height: '10px',
        backgroundColor: 'blue',
        position: 'absolute',
        top: `${arrY[i]}px`,
        left: `${arrX[i]}px`,
      }})
  }
})

const onmouseover = (e)=>{
  //console.log(e.target)
  console.log(e.target.getAttribute('text'))
}

const onmouseout = (e)=>{
  down.value = false
}

</script>

<template>
  <div style=" background-color: #c9c9c9; border: 2px solid black; overflow: hidden; position: relative;"
       :style="{width: configs.containerWidth + 'px', height: configs.containerHeight + 'px'}"
  @mousedown.prevent="onmousedown" @mouseup="onmouseup" @mousemove="onmousemove" @wheel="wheel" @click="onclick" @mouseout="onmouseout">


    <img src="@/assets/2.png" ref="img"
         style="object-fit: fill; position: absolute; z-index: 1;"
         :style="{width: w + 'px', height: h + 'px', left: left + 'px', top: top + 'px'}"
    />
    <canvas ref="canvas"
            :width="w" :height="h"
            style="position: absolute; background: transparent; z-index: 2;"
            :style="{ left: left + 'px', top: top + 'px'}">

    </canvas>

    <div ref="div1" style="position: absolute; background-color: rgba(255,255,0,0.4); z-index: 3"
      :style="{width: w+'px', height: h+'px', left: left + 'px', top: top + 'px'}"
    >
      <div
      v-for="(child, index) in children"
      :key = "index"
      :style="child.style"
      @mouseover="onmouseover"
      text = "你好"
      />

    </div>



  </div>

</template>

<style scoped>
canvas {
  border: 1px solid #000; /* 为了演示，添加一个边框 */
}
</style>


