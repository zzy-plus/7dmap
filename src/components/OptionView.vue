<script setup>
import {ref, onMounted, computed, watch} from "vue"
import {useDataStore} from "@/stores"
import {storeToRefs} from "pinia"
import configs from "@/configs";

const dataStore = useDataStore()
const ipc = myApi.ipc
const selected_world = ref(undefined)
const onSelectedWorldChange = (newWorld)=>{
  dataStore.setSelectedWorld(newWorld)
}


const world_options = ref([])
onMounted(async ()=>{
  const {status, data, msg} = await ipc.invoke('event_get_worlds','')
  if (status){
    world_options.value = data
  }else {
    ElMessage.error(msg)
    world_options.value = []
  }
})


const classOptions = ref({
  '0': false,
  '1': false,
  '2': false,
  '3': true,
  '4': true,
  '5': true,
  '6': true    //trader
})
watch(classOptions,()=>{
  dataStore.setClassOptions(classOptions.value)
},{deep:true})

const imgRef = ref('')
const {curId} = storeToRefs(useDataStore())
watch(curId,(newVal)=>{
  imgRef.value =
      configs.env === 'dev'?
          'src/res/pois/' + newVal + '.jpg'
          :
          '../../../res/pois/' + newVal + '.jpg'
})

const {jsonCSV} = storeToRefs(useDataStore())
const curModel = computed(()=>{
  return jsonCSV.value[curId.value]
})

const onSave = ()=>{
  if(!selected_world.value) return
  ipc.invoke('event_save_img', {
    world: selected_world.value,
    points: JSON.stringify(dataStore.points),
    mapSize: dataStore.mapInfo.size
  })
}



</script>



<template>
  <div style="width: 300px; height: 225px; background-color: #95d475; border: 2px solid black; overflow: hidden">
    <img :src="imgRef" style="width: 300px; height: 225px; object-fit: fill">
  </div>
  <div style="display: flex; flex-direction: column; justify-content: space-around; align-items: center; height: 420px;
        position: relative; top: 0;">
    <div style="color: #181818; font-size: 16px; font-weight: bolder">
      {{curModel? curModel.name: '请选择一个地图'}}：{{curModel? curModel.clazz: ''}}
    </div>
    <el-select
        v-model="selected_world"
        class="m-2"
        placeholder="选择世界"
        size="large"
        style="width: 240px"
        @change="onSelectedWorldChange"
    >
      <el-option
          v-for="item in world_options"
          :key="item"
          :label="item"
          :value="item"
      />
    </el-select>


    <div style="display: flex; flex-direction: column; align-items: flex-start; position: relative; left: -10px">
      <el-checkbox v-model="classOptions['6']" style="margin: 5px">
        <template #default>
          <el-tag effect="plain" type="success" :color="classOptions['6']? '#14dec6': '#ffffff'" size="large">
            <template #default>
              <div style="font-size: 14px; font-weight: bold" :style="{color: classOptions['6']? '#ffffff': '#14dec6'}">
                --&nbsp;商人&nbsp;--
              </div>
            </template>
          </el-tag>
        </template>
      </el-checkbox>
      <el-checkbox v-model="classOptions['5']" style="margin: 5px">
        <template #default>
          <el-tag effect="plain" type="success" :color="classOptions['5']? '#B431F8': '#ffffff'" size="large">
            <template #default>
              <div style="font-size: 14px; font-weight: bold" :style="{color: classOptions['5']? '#ffffff': '#B431F8'}">
                --&nbsp;五级&nbsp;--
              </div>
            </template>
          </el-tag>
        </template>
      </el-checkbox>
      <el-checkbox v-model="classOptions['4']" style="margin: 5px">
        <template #default>
          <el-tag effect="plain" type="success" :color="classOptions['4']? '#ff0b0b': '#ffffff'" size="large">
            <template #default>
              <div style="font-size: 14px; font-weight: bold" :style="{color: classOptions['4']? '#ffffff': '#ff0b0b'}">
                --&nbsp;四级&nbsp;--
              </div>
            </template>
          </el-tag>
        </template>
      </el-checkbox>
      <el-checkbox v-model="classOptions['3']" style="margin: 5px">
        <template #default>
          <el-tag effect="plain" type="success" :color="classOptions['3']? '#f3cd13': '#ffffff'" size="large">
            <template #default>
              <div style="font-size: 14px; font-weight: bold" :style="{color: classOptions['3']? '#ffffff': '#f3cd13'}">
                --&nbsp;三级&nbsp;--
              </div>
            </template>
          </el-tag>
        </template>
      </el-checkbox>
      <el-checkbox v-model="classOptions['2']" style="margin: 5px">
        <template #default>
          <el-tag effect="plain" type="success" :color="classOptions['2']? '#3b1ef1': '#ffffff'" size="large">
            <template #default>
              <div style="font-size: 14px; font-weight: bold" :style="{color: classOptions['2']? '#ffffff': '#3b1ef1'}">
                --&nbsp;二级&nbsp;--
              </div>
            </template>
          </el-tag>
        </template>
      </el-checkbox>
      <el-checkbox v-model="classOptions['1']" style="margin: 5px">
        <template #default>
          <el-tag effect="plain" type="success" :color="classOptions['1']? '#32d527': '#ffffff'" size="large">
            <template #default>
              <div style="font-size: 14px; font-weight: bold" :style="{color: classOptions['1']? '#ffffff': '#32d527'}">
                --&nbsp;一级&nbsp;--
              </div>
            </template>
          </el-tag>
        </template>
      </el-checkbox>
      <el-checkbox v-model="classOptions['0']" style="margin: 5px">
        <template #default>
          <el-tag effect="plain" type="success" :color="classOptions['0']? '#969696': '#ffffff'" size="large">
            <template #default>
              <div style="font-size: 14px; font-weight: bold" :style="{color: classOptions['0']? '#ffffff': '#969696'}">
                --&nbsp;其它&nbsp;--
              </div>
            </template>
          </el-tag>
        </template>
      </el-checkbox>
    </div>

    <el-button type="success" plain style="margin-top: 10px" @click="onSave">保存图片</el-button>


  </div>

</template>


