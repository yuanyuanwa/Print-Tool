<template>
  <div class="home-page page-container">
    <h1 class="page-title">数据概览</h1>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="(stat, index) in statsCards" :key="index">
        <div class="stat-icon" :style="{ background: stat.gradient }">
          <el-icon :size="28"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
        <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'" v-if="stat.trend">
          <el-icon><component :is="stat.trend > 0 ? 'Top' : 'Bottom'" /></el-icon>
          <span>{{ Math.abs(stat.trend) }}%</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="16">
          <div class="card chart-card">
            <div class="card-header">
              <h3>打印趋势</h3>
              <el-radio-group v-model="trendType" size="small">
                <el-radio-button value="week">近7天</el-radio-button>
                <el-radio-button value="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
            <BaseChart :option="trendChartOption" height="300px" :loading="loading" />
          </div>
        </el-col>
        <el-col :xs="24" :lg="8">
          <div class="card chart-card">
            <div class="card-header">
              <h3>文件类型分布</h3>
            </div>
            <BaseChart :option="pieChartOption" height="300px" :loading="loading" />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-actions">
      <h3 class="section-title">快捷操作</h3>
      <div class="actions-grid">
        <router-link to="/print" class="action-card">
          <div class="action-icon">
            <el-icon :size="32"><Printer /></el-icon>
          </div>
          <div class="action-info">
            <h4>开始打印</h4>
            <p>上传文件并打印</p>
          </div>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </router-link>

        <router-link to="/list" class="action-card">
          <div class="action-icon">
            <el-icon :size="32"><List /></el-icon>
          </div>
          <div class="action-info">
            <h4>数据列表</h4>
            <p>查看管理数据</p>
          </div>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </router-link>

        <div class="action-card" @click="handleHistory">
          <div class="action-icon">
            <el-icon :size="32"><Clock /></el-icon>
          </div>
          <div class="action-info">
            <h4>打印历史</h4>
            <p>查看历史记录</p>
          </div>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 最近打印记录 -->
    <div class="recent-section">
      <div class="section-header">
        <h3 class="section-title">最近打印</h3>
        <el-button type="primary" link @click="goToHistory">
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      
      <div class="recent-list" v-loading="loadingHistory">
        <div class="recent-item" v-for="item in recentHistory" :key="item.id">
          <div class="item-icon">
            <el-icon :size="20"><Document /></el-icon>
          </div>
          <div class="item-info">
            <p class="item-name">{{ item.fileName }}</p>
            <p class="item-meta">
              <span>{{ item.printerName }}</span>
              <span class="dot">·</span>
              <span>{{ formatTime(item.printTime) }}</span>
            </p>
          </div>
          <el-tag 
            :type="item.status === 'success' ? 'success' : item.status === 'failed' ? 'danger' : 'warning'"
            size="small"
          >
            {{ getStatusText(item.status) }}
          </el-tag>
        </div>

        <el-empty v-if="!loadingHistory && recentHistory.length === 0" description="暂无打印记录" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Printer, 
  Document, 
  DataBoard, 
  Monitor,
  ArrowRight,
  List,
  Clock,
  Top,
  Bottom
} from '@element-plus/icons-vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import { getDashboardStats } from '@/api/dashboard'
import { getPrintHistory } from '@/api/print'
import type { DashboardStats, PrintHistory } from '@/types'

const router = useRouter()

const loading = ref(false)
const loadingHistory = ref(false)
const trendType = ref('week')
const stats = ref<DashboardStats | null>(null)
const recentHistory = ref<PrintHistory[]>([])

// 统计卡片
const statsCards = computed(() => [
  {
    label: '今日打印',
    value: stats.value?.todayPrints || 0,
    icon: 'Printer',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    trend: 12
  },
  {
    label: '累计打印',
    value: stats.value?.totalPrints || 0,
    icon: 'Document',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    trend: 8
  },
  {
    label: '文件总数',
    value: stats.value?.totalFiles || 0,
    icon: 'DataBoard',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    trend: 5
  },
  {
    label: '在线打印机',
    value: stats.value?.activePrinters || 0,
    icon: 'Monitor',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    trend: 0
  }
])

// 趋势图配置
const trendChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: stats.value?.printTrend.map(item => {
      const date = new Date(item.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }) || []
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '打印次数',
      type: 'bar',
      data: stats.value?.printTrend.map(item => item.count) || [],
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#8B5CF6' },
            { offset: 1, color: '#7C3AED' }
          ]
        }
      }
    }
  ]
}))

// 饼图配置
const pieChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    bottom: '5%',
    left: 'center'
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#0F0F23',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      data: stats.value?.fileTypeStats.map(item => ({
        name: item.type,
        value: item.count
      })) || []
    }
  ]
}))

// 获取统计数据
async function fetchStats() {
  loading.value = true
  try {
    stats.value = await getDashboardStats()
  } finally {
    loading.value = false
  }
}

// 获取最近打印记录
async function fetchRecentHistory() {
  loadingHistory.value = true
  try {
    const result = await getPrintHistory({ page: 1, pageSize: 5 })
    recentHistory.value = result.list
  } finally {
    loadingHistory.value = false
  }
}

function formatTime(time: string) {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    pending: '进行中'
  }
  return statusMap[status] || status
}

function handleHistory() {
  router.push('/print')
}

function goToHistory() {
  router.push('/print')
}

onMounted(() => {
  fetchStats()
  fetchRecentHistory()
})
</script>

<style lang="scss" scoped>
.home-page {
  animation: fadeIn 0.5s ease-out;
}

// 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
  
  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @include mobile {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  @include tech-card;
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba($primary-color, 0.1) 0%, transparent 70%);
    transform: translate(30%, -30%);
  }
}

.stat-icon {
  width: 56px;
  height: 56px;
  @include flex-center;
  border-radius: $radius-lg;
  color: $text-white;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  
  .stat-value {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.2;
  }
  
  .stat-label {
    font-size: $font-size-sm;
    color: $text-muted;
    margin-top: 4px;
  }
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: $font-size-sm;
  font-weight: 500;
  
  &.up {
    color: $success-color;
  }
  
  &.down {
    color: $error-color;
  }
}

// 图表区域
.charts-section {
  margin-bottom: $spacing-xl;
}

.chart-card {
  height: 100%;
  
  .card-header {
    @include flex-between;
    margin-bottom: $spacing-md;
    
    h3 {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-primary;
    }
  }
}

// 快捷操作
.quick-actions {
  margin-bottom: $spacing-xl;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
  
  @include mobile {
    grid-template-columns: 1fr;
  }
}

.action-card {
  @include tech-card;
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  cursor: pointer;
  text-decoration: none;
  
  .action-icon {
    width: 56px;
    height: 56px;
    @include flex-center;
    background: rgba($primary-color, 0.15);
    border-radius: $radius-lg;
    color: $primary-color;
    transition: all $transition-normal;
  }
  
  .action-info {
    flex: 1;
    
    h4 {
      font-size: $font-size-base;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 4px;
    }
    
    p {
      font-size: $font-size-sm;
      color: $text-muted;
    }
  }
  
  .arrow {
    color: $text-muted;
    transition: all $transition-normal;
  }
  
  &:hover {
    .action-icon {
      background: $gradient-primary;
      color: $text-white;
    }
    
    .arrow {
      color: $primary-color;
      transform: translateX(4px);
    }
  }
}

// 最近打印
.recent-section {
  .section-header {
    @include flex-between;
    margin-bottom: $spacing-md;
  }
}

.recent-list {
  @include tech-card;
  padding: 0;
  overflow: hidden;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $border-light;
  transition: background $transition-fast;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba($primary-color, 0.05);
  }
  
  .item-icon {
    width: 40px;
    height: 40px;
    @include flex-center;
    background: rgba($primary-color, 0.1);
    border-radius: $radius-md;
    color: $primary-color;
  }
  
  .item-info {
    flex: 1;
    min-width: 0;
    
    .item-name {
      font-size: $font-size-sm;
      font-weight: 500;
      color: $text-primary;
      @include text-ellipsis;
    }
    
    .item-meta {
      font-size: $font-size-xs;
      color: $text-muted;
      margin-top: 2px;
      
      .dot {
        margin: 0 $spacing-xs;
      }
    }
  }
}
</style>
