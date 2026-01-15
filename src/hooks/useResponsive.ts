// ===========================
// 响应式 Hook
// ===========================

import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { DeviceType } from '@/types'
import { useAppStore } from '@/stores'

export function useResponsive() {
  const appStore = useAppStore()
  
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)
  
  // 设备类型
  const deviceType = computed<DeviceType>(() => {
    if (windowWidth.value < 768) {
      return 'mobile'
    } else if (windowWidth.value < 1024) {
      return 'tablet'
    }
    return 'desktop'
  })
  
  // 便捷判断
  const isMobile = computed(() => deviceType.value === 'mobile')
  const isTablet = computed(() => deviceType.value === 'tablet')
  const isDesktop = computed(() => deviceType.value === 'desktop')
  
  // 更新尺寸
  function updateSize() {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
    appStore.updateDeviceType()
  }
  
  // 节流
  let timer: ReturnType<typeof setTimeout> | null = null
  function handleResize() {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      updateSize()
    }, 100)
  }
  
  onMounted(() => {
    updateSize()
    window.addEventListener('resize', handleResize)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (timer) {
      clearTimeout(timer)
    }
  })
  
  return {
    windowWidth,
    windowHeight,
    deviceType,
    isMobile,
    isTablet,
    isDesktop
  }
}

// 媒体查询 Hook
export function useMediaQuery(query: string) {
  const matches = ref(false)
  
  let mediaQuery: MediaQueryList | null = null
  
  function updateMatches() {
    if (mediaQuery) {
      matches.value = mediaQuery.matches
    }
  }
  
  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches
    
    mediaQuery.addEventListener('change', updateMatches)
  })
  
  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', updateMatches)
    }
  })
  
  return matches
}
