<template>
  <div class="file-upload">
    <!-- 上传区域 -->
    <el-upload
      ref="uploadRef"
      class="upload-area"
      :class="{ 'is-dragover': isDragover }"
      drag
      :auto-upload="false"
      :show-file-list="false"
      :accept="accept"
      :on-change="handleFileChange"
      @dragenter="isDragover = true"
      @dragleave="isDragover = false"
      @drop="isDragover = false"
    >
      <div class="upload-content">
        <div class="upload-icon" :class="{ uploading }">
          <el-icon :size="48"><UploadFilled /></el-icon>
        </div>
        <div class="upload-text">
          <p class="main-text">将文件拖拽到此处，或 <span class="highlight">点击上传</span></p>
          <p class="sub-text">支持 PDF、Word 文档，单个文件不超过 20MB</p>
        </div>
      </div>
      
      <!-- 上传进度 -->
      <div class="upload-progress" v-if="uploading">
        <el-progress 
          :percentage="uploadProgress" 
          :stroke-width="4"
          :show-text="false"
        />
        <span class="progress-text">{{ uploadProgress }}%</span>
      </div>
    </el-upload>

    <!-- 已上传文件列表 -->
    <div class="file-list" v-if="files.length">
      <TransitionGroup name="file-list">
        <div 
          v-for="file in files" 
          :key="file.id"
          class="file-item"
          :class="{ selected: selectedFile?.id === file.id }"
          @click="$emit('select', file)"
        >
          <div class="file-icon">
            <el-icon :size="24">
              <Document v-if="file.type === 'pdf'" />
              <DocumentCopy v-else />
            </el-icon>
          </div>
          <div class="file-info">
            <p class="file-name">{{ file.name }}</p>
            <p class="file-meta">
              <span>{{ formatSize(file.size) }}</span>
              <span class="dot">·</span>
              <span>{{ formatTime(file.uploadTime) }}</span>
            </p>
          </div>
          <div class="file-actions">
            <el-button 
              type="danger" 
              :icon="Delete" 
              circle 
              size="small"
              @click.stop="handleDelete(file)"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled, Document, DocumentCopy, Delete } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import type { PrintFile } from '@/types'
import { formatFileSize } from '@/utils/print'

interface Props {
  files: PrintFile[]
  selectedFile?: PrintFile | null
  uploading?: boolean
  uploadProgress?: number
  accept?: string
}

const props = withDefaults(defineProps<Props>(), {
  files: () => [],
  selectedFile: null,
  uploading: false,
  uploadProgress: 0,
  accept: '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
})

const emit = defineEmits<{
  (e: 'upload', file: File): void
  (e: 'delete', file: PrintFile): void
  (e: 'select', file: PrintFile): void
}>()

const uploadRef = ref()
const isDragover = ref(false)

function handleFileChange(uploadFile: UploadFile) {
  if (uploadFile.raw) {
    emit('upload', uploadFile.raw)
  }
}

function handleDelete(file: PrintFile) {
  emit('delete', file)
}

function formatSize(size: number) {
  return formatFileSize(size)
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.file-upload {
  width: 100%;
}

.upload-area {
  :deep(.el-upload) {
    width: 100%;
  }
  
  :deep(.el-upload-dragger) {
    width: 100%;
    height: auto;
    min-height: 200px;
    background: rgba($primary-color, 0.05);
    border: 2px dashed $border-color;
    border-radius: $radius-lg;
    transition: all $transition-normal;
    
    &:hover {
      border-color: $primary-color;
      background: rgba($primary-color, 0.1);
    }
  }
  
  &.is-dragover {
    :deep(.el-upload-dragger) {
      border-color: $primary-color;
      background: rgba($primary-color, 0.15);
      box-shadow: $shadow-glow;
    }
  }
}

.upload-content {
  padding: $spacing-xl;
  text-align: center;
}

.upload-icon {
  margin-bottom: $spacing-md;
  color: $primary-color;
  transition: all $transition-normal;
  
  &.uploading {
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}

.upload-text {
  .main-text {
    font-size: $font-size-base;
    color: $text-primary;
    margin-bottom: $spacing-xs;
    
    .highlight {
      color: $primary-color;
      font-weight: 600;
    }
  }
  
  .sub-text {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.upload-progress {
  padding: $spacing-md $spacing-xl;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  
  :deep(.el-progress) {
    flex: 1;
  }
  
  :deep(.el-progress-bar__outer) {
    background: rgba($primary-color, 0.2);
  }
  
  :deep(.el-progress-bar__inner) {
    background: $gradient-primary;
  }
  
  .progress-text {
    font-size: $font-size-sm;
    color: $primary-color;
    font-weight: 600;
    min-width: 40px;
  }
}

.file-list {
  margin-top: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.file-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: rgba($primary-color, 0.05);
  border: 1px solid transparent;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-normal;
  
  &:hover {
    background: rgba($primary-color, 0.1);
    border-color: $border-color;
  }
  
  &.selected {
    background: rgba($primary-color, 0.15);
    border-color: $primary-color;
    box-shadow: $shadow-sm;
  }
}

.file-icon {
  width: 48px;
  height: 48px;
  @include flex-center;
  background: rgba($primary-color, 0.1);
  border-radius: $radius-md;
  color: $primary-color;
}

.file-info {
  flex: 1;
  min-width: 0;
  
  .file-name {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-primary;
    @include text-ellipsis;
  }
  
  .file-meta {
    font-size: $font-size-xs;
    color: $text-muted;
    margin-top: 2px;
    
    .dot {
      margin: 0 $spacing-xs;
    }
  }
}

.file-actions {
  :deep(.el-button) {
    opacity: 0.6;
    
    &:hover {
      opacity: 1;
    }
  }
}

// 列表动画
.file-list-enter-active,
.file-list-leave-active {
  transition: all 0.3s ease;
}

.file-list-enter-from,
.file-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
