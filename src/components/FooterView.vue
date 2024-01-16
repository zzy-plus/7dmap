<script setup>
import {useDataStore} from "@/stores";
import {storeToRefs} from "pinia";

const {mapInfo} = storeToRefs(useDataStore())

</script>

<template>
  <el-card >
    <div style="display: flex; justify-content: space-around; height: 40px">
      <div style="width: 140px">
        世界名称：{{mapInfo.name}}
      </div>
      <div style="width: 140px">
        大小：{{mapInfo.size}}&nbsp;x&nbsp;{{mapInfo.size}}
      </div>
    </div>
    <div style="display: flex; justify-content: space-around; height: 40px">
      <div style="width: 140px">
        版本：{{mapInfo.version}}
      </div>
      <div style="width: 140px">
        种子：{{mapInfo.seed}}
      </div>
    </div>

  </el-card>
</template>



