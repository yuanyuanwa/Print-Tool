<template>
  <div class="printer-select">
    <div class="section-header">
      <h3>选择打印机</h3>
      <el-button 
        type="primary" 
        link 
        :loading="loading"
        @click="$emit('refresh')"
      >
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <div class="printer-list" v-loading="loading">
      <div 
        v-for="printer in printers" 
        :key="printer.id"
        class="printer-item"
        :class="{ 
          selected: selectedPrinter?.id === printer.id,
          disabled: printer.status !== 'online'
        }"
        @click="handleSelect(printer)"
      >
        <div class="printer-icon">
          <el-icon :size="28"><Printer /></el-icon>
        </div>
        <div class="printer-info">
          <p class="printer-name">{{ printer.name }}</p>
          <p class="printer-type">{{ printer.type }}</p>
        </div>
        <div class="printer-status">
          <span class="status-dot" :class="printer.status"></span>
          <span class="status-text">{{ getStatusText(printer.status) }}</span>
        </div>
      </div>

      <el-empty 
        v-if="!loading && printers.length === 0" 
        description="未找到可用的打印机"
      />
    </div>

    <!-- 打印设置 -->
    <div class="print-settings" v-if="selectedPrinter">
      <h4>打印设置</h4>
      
      <el-form label-position="top" size="default">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="打印份数">
              <el-input-number 
                v-model="settings.copies" 
                :min="1" 
                :max="99"
                @change="handleSettingsChange"
              />
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12">
            <el-form-item label="纸张大小">
              <el-select 
                v-model="settings.paperSize"
                @change="handleSettingsChange"
              >
                <el-option label="A4" value="A4" />
                <el-option label="A3" value="A3" />
                <el-option label="Letter" value="Letter" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12">
            <el-form-item label="打印方向">
              <el-radio-group 
                v-model="settings.orientation"
                @change="handleSettingsChange"
              >
                <el-radio-button value="portrait">纵向</el-radio-button>
                <el-radio-button value="landscape">横向</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :sm="12">
            <el-form-item label="颜色模式">
              <el-radio-group 
                v-model="settings.colorMode"
                @change="handleSettingsChange"
              >
                <el-radio-button value="color">彩色</el-radio-button>
                <el-radio-button value="grayscale">黑白</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Printer, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Printer as PrinterType, PrintParams } from '@/types'

interface Props {
  printers: PrinterType[]
  selectedPrinter?: PrinterType | null
  loading?: boolean
  printParams?: Omit<PrintParams, 'fileId' | 'printerId'>
}

const props = withDefaults(defineProps<Props>(), {
  printers: () => [],
  selectedPrinter: null,
  loading: false,
  printParams: () => ({
    copies: 1,
    paperSize: 'A4',
    orientation: 'portrait',
    colorMode: 'color'
  })
})

const emit = defineEmits<{
  (e: 'select', printer: PrinterType): void
  (e: 'refresh'): void
  (e: 'update:settings', settings: Omit<PrintParams, 'fileId' | 'printerId'>): void
}>()

const settings = reactive({
  copies: 1,
  paperSize: 'A4' as 'A4' | 'A3' | 'Letter',
  orientation: 'portrait' as 'portrait' | 'landscape',
  colorMode: 'color' as 'color' | 'grayscale'
})

// 同步外部参数
watch(() => props.printParams, (newParams) => {
  if (newParams) {
    Object.assign(settings, newParams)
  }
}, { immediate: true })

function handleSelect(printer: PrinterType) {
  if (printer.status !== 'online') {
    ElMessage.warning('该打印机当前不可用')
    return
  }
  emit('select', printer)
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    online: '在线',
    offline: '离线',
    busy: '忙碌'
  }
  return statusMap[status] || status
}

function handleSettingsChange() {
  emit('update:settings', { ...settings })
}
</script>

<style lang="scss" scoped>
.printer-select {
  width: 100%;
}

.section-header {
  @include flex-between;
  margin-bottom: $spacing-md;
  
  h3 {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-primary;
  }
}

.printer-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  min-height: 100px;
}

.printer-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: rgba($primary-color, 0.05);
  border: 1px solid transparent;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-normal;
  
  &:hover:not(.disabled) {
    background: rgba($primary-color, 0.1);
    border-color: $border-color;
  }
  
  &.selected {
    background: rgba($primary-color, 0.15);
    border-color: $primary-color;
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.printer-icon {
  width: 48px;
  height: 48px;
  @include flex-center;
  background: rgba($primary-color, 0.1);
  border-radius: $radius-md;
  color: $primary-color;
}

.printer-info {
  flex: 1;
  min-width: 0;
  
  .printer-name {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-primary;
    @include text-ellipsis;
  }
  
  .printer-type {
    font-size: $font-size-xs;
    color: $text-muted;
    margin-top: 2px;
  }
}

.printer-status {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.online {
      background: $success-color;
      box-shadow: 0 0 8px rgba($success-color, 0.5);
    }
    
    &.offline {
      background: $text-muted;
    }
    
    &.busy {
      background: $warning-color;
      box-shadow: 0 0 8px rgba($warning-color, 0.5);
    }
  }
  
  .status-text {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.print-settings {
  margin-top: $spacing-xl;
  padding-top: $spacing-lg;
  border-top: 1px solid $border-light;
  
  h4 {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
  
  :deep(.el-form-item__label) {
    color: $text-secondary;
  }
  
  :deep(.el-input-number) {
    width: 100%;
  }
  
  :deep(.el-select) {
    width: 100%;
  }
  
  :deep(.el-radio-group) {
    width: 100%;
    display: flex;
    
    .el-radio-button {
      flex: 1;
      
      .el-radio-button__inner {
        width: 100%;
      }
    }
  }
}
</style>
