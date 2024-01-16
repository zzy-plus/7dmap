import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', () => {

  const selectedWorld = ref(undefined)
  const setSelectedWorld = (newVal)=>{
    selectedWorld.value = newVal
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
  const setClassOptions = (newVal)=>{
    classOptions.value = newVal
  }

  const mapInfo = ref({
    name:'',
    size:'',
    version:'',
    seed:''
  })
  const setMapInfo = (newVal)=>{
    mapInfo.value = newVal
  }

  const curId = ref('')
  const setCurId = (newVal)=>{
    curId.value = newVal
  }

  const jsonCSV = ref({})
  const setJsonCSV = (newVal)=>{
    jsonCSV.value = newVal
  }




  return {
    selectedWorld,
    setSelectedWorld,
    classOptions,
    setClassOptions,
    mapInfo,
    setMapInfo,
    curId,
    setCurId,
    jsonCSV,
    setJsonCSV

  }
})
