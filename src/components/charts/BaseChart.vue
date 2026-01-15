<template>
  <div class="base-chart" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface Props {
  option: EChartsOption
  height?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  loading: false
})

const chartRef = ref<HTMLDivElement>()
const chartInstance = shallowRef<echarts.ECharts>()

// 科技感主题配置
const techTheme = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#E2E8F0'
  },
  title: {
    textStyle: {
      color: '#E2E8F0'
    }
  },
  legend: {
    textStyle: {
      color: '#94A3B8'
    }
  },
  tooltip: {
    backgroundColor: 'rgba(15, 15, 35, 0.9)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    textStyle: {
      color: '#E2E8F0'
    }
  },
  xAxis: {
    axisLine: {
      lineStyle: {
        color: 'rgba(139, 92, 246, 0.3)'
      }
    },
    axisLabel: {
      color: '#94A3B8'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(139, 92, 246, 0.1)'
      }
    }
  },
  yAxis: {
    axisLine: {
      lineStyle: {
        color: 'rgba(139, 92, 246, 0.3)'
      }
    },
    axisLabel: {
      color: '#94A3B8'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(139, 92, 246, 0.1)'
      }
    }
  },
  color: ['#8B5CF6', '#A78BFA', '#7C3AED', '#6D28D9', '#C4B5FD', '#DDD6FE']
}

// 初始化图表
function initChart() {
  if (!chartRef.value) return
  
  // 注册主题
  echarts.registerTheme('tech', techTheme)
  
  chartInstance.value = echarts.init(chartRef.value, 'tech')
  chartInstance.value.setOption(props.option)
}

// 更新图表
function updateChart() {
  if (chartInstance.value) {
    chartInstance.value.setOption(props.option, true)
  }
}

// 调整大小
function handleResize() {
  chartInstance.value?.resize()
}

// 监听配置变化
watch(() => props.option, updateChart, { deep: true })

// 监听 loading 状态
watch(() => props.loading, (loading) => {
  if (chartInstance.value) {
    if (loading) {
      chartInstance.value.showLoading({
        text: '加载中...',
        color: '#8B5CF6',
        textColor: '#E2E8F0',
        maskColor: 'rgba(15, 15, 35, 0.8)'
      })
    } else {
      chartInstance.value.hideLoading()
    }
  }
})

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance.value?.dispose()
})

// 暴露方法
defineExpose({
  getChartInstance: () => chartInstance.value,
  resize: handleResize
})
</script>

<style lang="scss" scoped>
.base-chart {
  width: 100%;
  height: v-bind(height);
}
</style>
