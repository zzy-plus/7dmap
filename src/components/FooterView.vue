<script setup>
import {useDataStore} from "@/stores";
import {storeToRefs} from "pinia";

const dataStore = useDataStore()
const {mapInfo} = storeToRefs(useDataStore())

const {curPos} = storeToRefs(useDataStore())


</script>

<template>

  <div style="color: #2a2a2a; display: flex; flex-direction: column; align-items: center;  height: 120px">

    <div style="color: #ff460e; font-size: 14px; font-weight: bolder; background-color: #c0eaa9;
        padding-left: 6px; padding-right: 6px">
      X:{{curPos?.real_x}}&nbsp;&nbsp;&nbsp;Y:{{curPos?.real_y}}&nbsp;&nbsp;&nbsp;Z:{{curPos?.real_z}}
    </div>


    <div style="position: relative; top: 5px">
      <div style="display: flex; justify-content: space-evenly; width: 600px;
           font-size: 14px;  color: #E6A23C; margin-top: 5px">
        <div style="font-weight: bold">
          世界名称：{{mapInfo.name}}
        </div>
        <div style="font-weight: bold">
          大小：{{mapInfo.size}}&nbsp;x&nbsp;{{mapInfo.size}}
        </div>
      </div>
      <div style="display: flex; justify-content: space-evenly; width: 600px;
           font-size: 14px; color: #E6A23C; margin-top: 5px">
        <div style="font-weight: bold">
          版本：{{mapInfo.version}}
        </div>
        <div style="font-weight: bold">
          种子：{{mapInfo.seed}}
        </div>
      </div>

    </div>



  </div>




</template>



