<script setup>
import {ref, onMounted, computed, watch} from "vue"
import {useDataStore} from "@/stores"
import {storeToRefs} from "pinia"
import configs from "@/configs"

const dataStore = useDataStore()
const ipc = myApi.ipc
const selected_world = ref(undefined)
const onSelectedWorldChange = (newWorld) => {
  dataStore.setSelectedWorld(worlCollection[newWorld])

}


const world_options = ref([])
let worlCollection = null
onMounted(()=>{
  getWorlds(false)
})

const getWorlds = async (flag)=>{
  /**
   * flag == true: 服务器地图
   * flag == false: 本地地图
   */
  let status, data, msg
  if(flag){
    ({status, data, msg} = await ipc.invoke('event_get_server_worlds',''))
  }else {
    ({status, data, msg} = await ipc.invoke('event_get_worlds',''))
  }
  if (status){
    worlCollection = data
    world_options.value = Object.keys(data)
  }else {
    ElMessage({
      type: 'error',
      message: msg,
      showClose: true,
      duration: 4000
    })
    world_options.value = []
  }
}


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
  if(!selected_world.value && !dataStore.selectedPath) return
  if(selected_world.value){
    ipc.invoke('event_save_img', {
      world: selected_world.value,
      points: JSON.stringify(dataStore.points),
      mapSize: dataStore.mapInfo.size
    })
  }else {
    ipc.invoke('event_save_img', {
      world: dataStore.selectedPath,
      points: JSON.stringify(dataStore.points),
      mapSize: dataStore.mapInfo.size
    })
  }
}

const browseWorld = async ()=>{
  const {status, data, msg} = await ipc.invoke('event_browse_world','')
  if(status){
    if(!data) return;
    dataStore.setSelectedWorld(data)

    selected_world.value = null
  }else {
    ElMessage.error(msg)
  }
}

// checkbox
const temp = {}
for (const selcetionKey in configs.selcetions) {
  temp[selcetionKey] = true
}
const selec_checkbox = ref(temp)

const selections = computed(()=>{
  return Object.keys(selec_checkbox.value).filter(i=>selec_checkbox.value[i])
})

watch(selections,(newVal)=>{
  if(enableSelection.value){
    dataStore.setSelections(newVal)
  }
},{deep:true})
const enableSelection = ref(false)
watch(enableSelection,(newVal)=>{
  if(newVal){ //开启筛选
    dataStore.setSelections(selections.value)
  }else {   //关闭筛选
    dataStore.setSelections(undefined)
  }
})


const isServerMap = ref(false)
watch(isServerMap, (val)=>{
  selected_world.value = null
  getWorlds(val)
})

</script>



<template>

  <div style="width: 300px; height: 225px; background-color: #e7fad5; border: 2px solid black; overflow: hidden;
      position: relative">
    <img :src="imgRef" style="width: 300px; height: 225px; object-fit: fill" v-if="imgRef"/>
    <el-empty :image-size="110" v-if="!imgRef" description="持续更新中&&免费软件&&开源" style="z-index: 5;
              position: absolute; left: 50px; top: 0"/>
  </div>

  <!-- 提示 -->
  <div style="display: flex; flex-direction: column; align-items: center">
    <div style="color: #181818; font-size: 14px; font-weight: bolder; height: 20px">
      {{curModel? curModel.clazz + '级': '--'}}&nbsp;{{curModel? '  ' + curModel.cname: '--'}}
    </div>
    <div style="color: #181818; font-size: 14px; font-weight: bolder; height: 20px">
      {{curModel? curModel.name: '请选择一张地图:'}}
    </div>
  </div>


  <div style="display: flex; flex-direction: column; justify-content: space-around; align-items: center; height: 400px;
        position: relative; top: 0; ">
    <div style="display: flex; justify-content: space-evenly; align-items: center;">
      <el-select
          v-model="selected_world"
          class="m-2"
          placeholder="选择世界"
          size="default"
          style="width: 170px"
          @change="onSelectedWorldChange"
      >
        <el-option
            v-for="item in world_options"
            :key="item"
            :label="item"
            :value="item"
        />
      </el-select>

      <div>
        <el-button type="warning" style="width: 75px; position: relative; left: 5px" @click="browseWorld">
          手动选择
        </el-button>
      </div>

    </div>

    <div >
      <el-tooltip
          class="box-item"
          effect="dark"
          content="勾选此选项后，下拉框中显示的世界均为从公共服务器下载的地图"
          placement="bottom"
      >
        <el-checkbox v-model="isServerMap" label="服务器缓存地图"
                     style="margin: 0; position: relative; left: -60px; color: #f5ab11" />
      </el-tooltip>

    </div>

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

    <el-popover placement="top" :width="200" trigger="click">
      <template #reference>
        <el-button type="primary" plain >筛选建筑类型</el-button>
      </template>
      <el-checkbox v-model="enableSelection" label="启用筛选" />
      <el-checkbox v-for="(value, key) in selec_checkbox" v-model="selec_checkbox[key]" :key="key" :disabled="!enableSelection">
        {{configs.selcetions[key]}}
      </el-checkbox>
    </el-popover>

  </div>

  <el-button type="success" plain style="margin-top: 10px; position: relative; left: 107px" @click="onSave">
    保存地图
  </el-button>


</template>


