<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

onMounted(() => {
  // 初始化设备类型检测
  appStore.updateDeviceType()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    appStore.updateDeviceType()
  })
})
</script>

<style lang="scss">
// 全局样式已在 main.ts 中引入
</style>
