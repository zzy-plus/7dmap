<script setup>
import '@/assets/index.css'
import ImgContainer from "@/components/ImgContainer.vue";
import OptionView from "@/components/OptionView.vue";
import FooterView from "@/components/FooterView.vue";


</script>


<template>
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


