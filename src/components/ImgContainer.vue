<script setup>

import {ref} from "vue";

const img = ref(null)
const canvas = ref(null)

const w = ref(400)
const h = ref(400)
const left = ref(0)
const top = ref(0)



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
    w.value += 50
    h.value += 50
    left.value -= e.offsetX/w.value * 50
    console.log(e.offsetX/w.value * 50)
    top.value -= e.offsetY/h.value * 50
  }else if(e.deltaY > 1){ //滚轮向下
    //if(h.value<=400) return    //对缩放行为的限制
    w.value -= 50
    h.value -= 50
    left.value += e.offsetX/w.value * 50
    top.value += e.offsetY/h.value *50
  }
  //console.log(e)
}

const onclick = (e)=>{
  console.log(e)
  // console.log(img.value.width)
  const ctx = canvas.value.getContext('2d');
  // 在canvas上绘制一个矩形
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.fillRect(50, 50, 100, 100);
}

</script>

<template>
  <div>图片容器组件</div>
  <div style="height: 400px; width: 400px; background-color: #c9c9c9; border: 2px solid black; overflow: hidden; position: relative; "
  @mousedown.prevent="onmousedown" @mouseup="onmouseup" @mousemove="onmousemove" @wheel="wheel" @click="onclick">


    <img src="@/assets/1.jpg" ref="img"
         style="object-fit: fill; position: absolute; z-index: 1;"
         :style="{width: w + 'px', height: h + 'px', left: left + 'px', top: top + 'px'}"
    />
    <canvas ref="canvas"
            style="position: absolute; background: transparent; z-index: 2;"
            :style="{width: w + 'px', height: h + 'px', left: left + 'px', top: top + 'px'}">

    </canvas>



  </div>

</template>

<style scoped>
canvas {
  border: 1px solid #000; /* 为了演示，添加一个边框 */
}
</style>


