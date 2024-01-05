<script setup>

import {onMounted, ref, watch} from "vue";

const img = ref(null)
const canvas = ref(null)

const w = ref(400)
const h = ref(400)
const left = ref(0)
const top = ref(0)
const div1 = ref(null)
const children = ref([])


const down = ref(false)

const onmousemove = (e)=>{
  if(down.value){
    //对拖拽行为的限制
    // if(left.value>=0 && e.movementX>0 ) return;
    // if(left.value + w.value <= 400 && e.movementX<0) return;
    // if(top.value>=0 && e.movementY>0 ) return;
    // if(top.value + h.value <= 400 && e.movementY<0) return;
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
    w.value += w.value>1000? 100:50
    h.value += h.value>1000? 100:50
    left.value -= e.offsetX/w.value * (w.value>1000? 100:50)
    top.value -= e.offsetY/h.value * (h.value>1000? 100:50)
  }else if(e.deltaY > 1){ //滚轮向下
    //if(h.value<=400) return    //对缩放行为的限制
    w.value -= w.value>1000? 100:50
    h.value -= h.value>1000? 100:50
    left.value += e.offsetX/w.value * (w.value>1000? 100:50)
    top.value += e.offsetY/h.value * (h.value>1000? 100:50)
  }
  //console.log(e)
  for (const index in children.value) {
    children.value[index].style = {
      width: '10px',
      height: '10px',
      backgroundColor: 'blue',
      position: 'absolute',
      top: `${Math.random() * h.value}px`,
      left: `${Math.random() * w.value}px`,
    }
  }
}

const onclick = (e)=>{
children.value.push({style:{
    width: '10px',
    height: '10px',
    backgroundColor: 'blue',
    position: 'absolute',
    top: `${Math.random() * 400}px`,
    left: `${Math.random() * 400}px`,
  }})
}

watch(w,(new_w)=>{


})

onMounted(()=>{
  for (let i = 0; i <100; i++) {
    children.value.push({style:{
        width: '10px',
        height: '10px',
        backgroundColor: 'blue',
        position: 'absolute',
        top: `${Math.random() * 400}px`,
        left: `${Math.random() * 400}px`,
      }})
  }
})

const onmouseover = (e)=>{
  //console.log(e.target)
  console.log(e.target.getAttribute('text'))
}

</script>

<template>
  <div>图片容器组件</div>
  <div style="height: 400px; width: 400px; background-color: #c9c9c9; border: 2px solid black; overflow: hidden; position: relative; "
  @mousedown.prevent="onmousedown" @mouseup="onmouseup" @mousemove="onmousemove" @wheel="wheel" @click="onclick">


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


