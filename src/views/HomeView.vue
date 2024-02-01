<script setup>
import '@/assets/index.css'
import {ref} from "vue"
import ImgContainer from "@/components/ImgContainer.vue"
import OptionView from "@/components/OptionView.vue"
import FooterView from "@/components/FooterView.vue"
import {useDataStore} from "@/stores"

const ipc = myApi.ipc
const dataStore = useDataStore()

const drawerVisible = ref(false)
const modelName = ref('')
const tableData = ref([])

myApi.ipcListen('e_search_dialog',(e, msg)=>{
  drawerVisible.value = true
})

const getSearchData = async ()=>{
  const points = dataStore.points
  const tempTableData = []
  for (const point of points) {
    if(!point.name.toLowerCase().includes(modelName.value.toLowerCase())) continue
    tempTableData.push({
      id: point.id,
      name: point.name,
      cname: point.cname,
      clazz: point.clazz,
      position: `(${point.real_x},${point.real_y},${point.real_z})`
    })
  }
  tableData.value = tempTableData

}

</script>


<template>

  <el-drawer
      v-model="drawerVisible"
      direction="rtl"
      size="60%"
      :with-header="false"
  >

    <template #default>
      <div style=" margin-bottom: 10px; display: flex">
        <el-tag type="danger">
          注意：仅支持英文名称搜索
        </el-tag>
        <el-tag type="warning" style="margin-left: 5px">
          需要先在主页面选择一个世界
        </el-tag>
      </div>
      <el-input v-model="modelName" placeholder="输入建筑英文名称" style="width: 180px; margin-right: 10px"/>
      <el-button type="primary" @click="getSearchData">搜索</el-button>

      <el-table :data="tableData" height="600" style="width: 100%; margin-top: 5px" border>
        <el-table-column prop="name" label="Name" width="100" fixed/>
        <el-table-column prop="cname" label="名称" width="100"/>
        <el-table-column prop="id" label="代码" width="100"/>
        <el-table-column prop="clazz" label="等级" width="40"/>
        <el-table-column prop="position" label="位置(x,y,z)" width="130"/>
      </el-table>

    </template>
  </el-drawer>

  <div style="position: absolute; top: 0; left: 0">
    <ImgContainer/>
  </div>

  <div style="position: absolute; left: 600px; top: 0; height: 720px; width: 300px; background-color: white">
    <OptionView/>
  </div>

  <div style="position: absolute; left: 0; top: 600px; width: 600px; background-color: white">
    <FooterView/>
  </div>
</template>


