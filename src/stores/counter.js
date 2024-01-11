import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', () => {
  const points = ref([])

  const setPoints = (newVal)=>{
    points.value = newVal
  }

  return {
    points,
    setPoints,


  }
})
