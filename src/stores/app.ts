// ===========================
// 应用状态管理
// ===========================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DeviceType } from '@/types'

export const useAppStore = defineStore('app', () => {
  // 状态
  const sidebarCollapsed = ref(false)
  const deviceType = ref<DeviceType>('desktop')
  const loading = ref(false)
  const menuVisible = ref(false) // 移动端菜单显示状态
  
  // 计算属性
  const isMobile = computed(() => deviceType.value === 'mobile')
  const isTablet = computed(() => deviceType.value === 'tablet')
  const isDesktop = computed(() => deviceType.value === 'desktop')
  
  // 切换侧边栏
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  // 设置设备类型
  function setDeviceType(type: DeviceType) {
    deviceType.value = type
    
    // 移动端默认收起侧边栏
    if (type === 'mobile') {
      sidebarCollapsed.value = true
    }
  }
  
  // 设置加载状态
  function setLoading(status: boolean) {
    loading.value = status
  }
  
  // 切换移动端菜单
  function toggleMenu() {
    menuVisible.value = !menuVisible.value
  }
  
  // 关闭移动端菜单
  function closeMenu() {
    menuVisible.value = false
  }
  
  // 根据窗口宽度自动设置设备类型
  function updateDeviceType() {
    const width = window.innerWidth
    
    if (width < 768) {
      setDeviceType('mobile')
    } else if (width < 1024) {
      setDeviceType('tablet')
    } else {
      setDeviceType('desktop')
    }
  }
  
  return {
    sidebarCollapsed,
    deviceType,
    loading,
    menuVisible,
    isMobile,
    isTablet,
    isDesktop,
    toggleSidebar,
    setDeviceType,
    setLoading,
    toggleMenu,
    closeMenu,
    updateDeviceType
  }
})
