<template>
  <div class="print-page page-container">
    <h1 class="page-title">打印中心</h1>

    <el-row :gutter="20">
      <!-- 左侧：文件上传区 -->
      <el-col :xs="24" :lg="14">
        <div class="card upload-section">
          <h3 class="section-title">上传文件</h3>
          <FileUpload
            :files="uploadedFiles"
            :selected-file="selectedFile"
            :uploading="uploading"
            :upload-progress="uploadProgress"
            @upload="handleUpload"
            @delete="handleDeleteFile"
            @select="selectFile"
          />
        </div>

        <!-- 文件预览 -->
        <div class="card preview-section" v-if="selectedFile">
          <div class="section-header">
            <h3 class="section-title">文件预览</h3>
            <el-button type="primary" link @click="handlePreviewFullscreen">
              <el-icon><FullScreen /></el-icon>
              全屏预览
            </el-button>
          </div>
          
          <div class="preview-container">
            <div class="preview-placeholder" v-if="!previewUrl">
              <el-icon :size="48"><Document /></el-icon>
              <p>{{ selectedFile.name }}</p>
              <p class="preview-tip">预览加载中...</p>
            </div>
            <iframe 
              v-else
              :src="previewUrl" 
              class="preview-iframe"
              frameborder="0"
            ></iframe>
          </div>
        </div>
      </el-col>

      <!-- 右侧：打印设置 -->
      <el-col :xs="24" :lg="10">
        <div class="card printer-section">
          <PrinterSelect
            :printers="printers"
            :selected-printer="selectedPrinter"
            :loading="loadingPrinters"
            :print-params="printParams"
            @select="selectPrinter"
            @refresh="loadPrinters"
            @update:settings="updatePrintParams"
          />

          <!-- 打印按钮 -->
          <div class="print-actions">
            <el-button
              type="primary"
              size="large"
              class="print-btn"
              :loading="printing"
              :disabled="!canPrint"
              @click="handlePrint"
            >
              <el-icon><Printer /></el-icon>
              {{ printing ? '打印中...' : '开始打印' }}
            </el-button>
            
            <div class="print-tips" v-if="!canPrint">
              <el-icon><InfoFilled /></el-icon>
              <span v-if="!selectedFile">请先上传并选择文件</span>
              <span v-else-if="!selectedPrinter">请选择打印机</span>
              <span v-else-if="selectedPrinter.status !== 'online'">所选打印机不可用</span>
            </div>
          </div>
        </div>

        <!-- 打印历史 -->
        <div class="card history-section">
          <div class="section-header">
            <h3 class="section-title">打印历史</h3>
            <el-button type="primary" link @click="refreshHistory">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>

          <div class="history-list" v-loading="loadingHistory">
            <div 
              class="history-item" 
              v-for="item in printHistory" 
              :key="item.id"
            >
              <div class="history-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="history-info">
                <p class="history-name">{{ item.fileName }}</p>
                <p class="history-meta">
                  {{ item.copies }} 份 · {{ formatTime(item.printTime) }}
                </p>
              </div>
              <el-tag 
                :type="getStatusType(item.status)"
                size="small"
              >
                {{ getStatusText(item.status) }}
              </el-tag>
            </div>

            <el-empty 
              v-if="!loadingHistory && printHistory.length === 0" 
              description="暂无打印记录"
              :image-size="80"
            />
          </div>

          <!-- 分页 -->
          <div class="history-pagination" v-if="historyTotal > historyPageSize">
            <el-pagination
              v-model:current-page="historyPage"
              :page-size="historyPageSize"
              :total="historyTotal"
              layout="prev, pager, next"
              small
              @current-change="fetchHistory"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 全屏预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="文件预览"
      width="90%"
      top="5vh"
      class="preview-dialog"
    >
      <div class="fullscreen-preview">
        <iframe 
          v-if="previewUrl"
          :src="previewUrl" 
          class="preview-iframe-full"
          frameborder="0"
        ></iframe>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Printer, 
  Document, 
  FullScreen, 
  Refresh,
  InfoFilled
} from '@element-plus/icons-vue'
import FileUpload from '@/components/common/FileUpload.vue'
import PrinterSelect from '@/components/common/PrinterSelect.vue'
import { usePrint } from '@/hooks/usePrint'
import { getPrintHistory } from '@/api/print'
import type { PrintHistory, PrintParams } from '@/types'

const {
  uploadedFiles,
  printers,
  selectedFile,
  selectedPrinter,
  uploading,
  uploadProgress,
  printing,
  loadingPrinters,
  printParams,
  canPrint,
  handleUpload,
  handleDeleteFile,
  loadPrinters,
  handlePrint,
  selectFile,
  selectPrinter,
  updatePrintParams
} = usePrint()

// 预览相关
const previewUrl = ref('')
const previewDialogVisible = ref(false)

// 历史记录
const printHistory = ref<PrintHistory[]>([])
const loadingHistory = ref(false)
const historyPage = ref(1)
const historyPageSize = ref(5)
const historyTotal = ref(0)

// 监听选中文件变化，更新预览
watch(selectedFile, (file) => {
  if (file) {
    previewUrl.value = file.url
  } else {
    previewUrl.value = ''
  }
})

// 获取打印历史
async function fetchHistory() {
  loadingHistory.value = true
  try {
    const result = await getPrintHistory({
      page: historyPage.value,
      pageSize: historyPageSize.value
    })
    printHistory.value = result.list
    historyTotal.value = result.total
  } catch (error) {
    ElMessage.error('获取打印历史失败')
  } finally {
    loadingHistory.value = false
  }
}

function refreshHistory() {
  historyPage.value = 1
  fetchHistory()
}

function handlePreviewFullscreen() {
  if (selectedFile.value) {
    previewDialogVisible.value = true
  }
}

function formatTime(time: string) {
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusType(status: string) {
  const typeMap: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
    success: 'success',
    failed: 'danger',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    pending: '进行中'
  }
  return textMap[status] || status
}

onMounted(() => {
  loadPrinters()
  fetchHistory()
})
</script>

<style lang="scss" scoped>
.print-page {
  animation: fadeIn 0.5s ease-out;
}

.section-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.section-header {
  @include flex-between;
  margin-bottom: $spacing-md;
}

// 上传区
.upload-section {
  margin-bottom: $spacing-lg;
}

// 预览区
.preview-section {
  margin-bottom: $spacing-lg;
  
  @include desktop {
    margin-bottom: 0;
  }
}

.preview-container {
  border: 1px solid $border-light;
  border-radius: $radius-md;
  overflow: hidden;
  min-height: 300px;
  background: rgba($bg-darker, 0.5);
}

.preview-placeholder {
  height: 300px;
  @include flex-center;
  @include flex-column;
  gap: $spacing-sm;
  color: $text-muted;
  
  p {
    text-align: center;
    max-width: 80%;
    @include text-ellipsis;
  }
  
  .preview-tip {
    font-size: $font-size-sm;
  }
}

.preview-iframe {
  width: 100%;
  height: 300px;
  background: white;
}

// 打印机区
.printer-section {
  margin-bottom: $spacing-lg;
}

.print-actions {
  margin-top: $spacing-xl;
  padding-top: $spacing-lg;
  border-top: 1px solid $border-light;
}

.print-btn {
  width: 100%;
  height: 52px;
  font-size: $font-size-lg;
  font-weight: 600;
  
  .el-icon {
    margin-right: $spacing-sm;
  }
}

.print-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  margin-top: $spacing-md;
  color: $text-muted;
  font-size: $font-size-sm;
}

// 历史记录
.history-section {
  .history-list {
    min-height: 200px;
  }
}

.history-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm 0;
  border-bottom: 1px solid $border-light;
  
  &:last-child {
    border-bottom: none;
  }
  
  .history-icon {
    width: 36px;
    height: 36px;
    @include flex-center;
    background: rgba($primary-color, 0.1);
    border-radius: $radius-sm;
    color: $primary-color;
  }
  
  .history-info {
    flex: 1;
    min-width: 0;
    
    .history-name {
      font-size: $font-size-sm;
      color: $text-primary;
      @include text-ellipsis;
    }
    
    .history-meta {
      font-size: $font-size-xs;
      color: $text-muted;
      margin-top: 2px;
    }
  }
}

.history-pagination {
  margin-top: $spacing-md;
  display: flex;
  justify-content: center;
}

// 全屏预览
.preview-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.fullscreen-preview {
  height: 80vh;
}

.preview-iframe-full {
  width: 100%;
  height: 100%;
  background: white;
}

// 响应式调整
@include mobile {
  .printer-section,
  .history-section {
    margin-top: $spacing-lg;
  }
}
</style>
