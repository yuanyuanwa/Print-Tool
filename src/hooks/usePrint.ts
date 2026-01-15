// ===========================
// 打印功能 Hook
// ===========================

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { PrintFile, Printer, PrintParams } from '@/types'
import { uploadFile, getPrinters, executePrint, deleteFile } from '@/api/print'
import { printPdf, formatFileSize, validateFileType } from '@/utils/print'

// 允许的文件类型
const ALLOWED_TYPES = ['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

// 最大文件大小 (20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024

export function usePrint() {
  // 状态
  const uploadedFiles = ref<PrintFile[]>([])
  const printers = ref<Printer[]>([])
  const selectedFile = ref<PrintFile | null>(null)
  const selectedPrinter = ref<Printer | null>(null)
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const printing = ref(false)
  const loadingPrinters = ref(false)
  
  // 打印参数
  const printParams = ref<Omit<PrintParams, 'fileId' | 'printerId'>>({
    copies: 1,
    paperSize: 'A4',
    orientation: 'portrait',
    colorMode: 'color'
  })
  
  // 计算属性
  const canPrint = computed(() => {
    return selectedFile.value && selectedPrinter.value && selectedPrinter.value.status === 'online' && !printing.value
  })
  
  const onlinePrinters = computed(() => {
    return printers.value.filter(p => p.status === 'online')
  })
  
  // 验证文件
  function validateFile(file: File): string | null {
    if (!validateFileType(file, ALLOWED_TYPES)) {
      return '只支持 PDF 和 Word 文档格式'
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `文件大小不能超过 ${formatFileSize(MAX_FILE_SIZE)}`
    }
    
    return null
  }
  
  // 上传文件
  async function handleUpload(file: File) {
    const error = validateFile(file)
    if (error) {
      ElMessage.error(error)
      return false
    }
    
    uploading.value = true
    uploadProgress.value = 0
    
    try {
      const result = await uploadFile(file, (percent) => {
        uploadProgress.value = percent
      })
      
      uploadedFiles.value.push(result)
      selectedFile.value = result
      
      ElMessage.success('文件上传成功')
      return true
    } catch (error) {
      ElMessage.error('文件上传失败')
      return false
    } finally {
      uploading.value = false
    }
  }
  
  // 删除文件
  async function handleDeleteFile(file: PrintFile) {
    try {
      await deleteFile(file.id)
      
      uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== file.id)
      
      if (selectedFile.value?.id === file.id) {
        selectedFile.value = null
      }
      
      ElMessage.success('文件已删除')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }
  
  // 加载打印机列表
  async function loadPrinters() {
    loadingPrinters.value = true
    
    try {
      printers.value = await getPrinters()
      
      // 默认选择第一个在线的打印机
      const onlinePrinter = printers.value.find(p => p.status === 'online')
      if (onlinePrinter) {
        selectedPrinter.value = onlinePrinter
      }
    } catch (error) {
      ElMessage.error('获取打印机列表失败')
    } finally {
      loadingPrinters.value = false
    }
  }
  
  // 执行打印
  async function handlePrint() {
    if (!canPrint.value) {
      ElMessage.warning('请先选择文件和打印机')
      return
    }
    
    printing.value = true
    
    try {
      const params: PrintParams = {
        fileId: selectedFile.value!.id,
        printerId: selectedPrinter.value!.id,
        ...printParams.value
      }
      
      const result = await executePrint(params)
      
      ElMessage.success(`打印任务已提交，任务ID: ${result.jobId}`)
      
      // 如果是 PDF，也可以使用浏览器打印
      if (selectedFile.value?.type === 'pdf' && selectedFile.value.url) {
        printPdf(selectedFile.value.url)
      }
      
      return result
    } catch (error) {
      ElMessage.error('打印失败')
    } finally {
      printing.value = false
    }
  }
  
  // 选择文件
  function selectFile(file: PrintFile) {
    selectedFile.value = file
  }
  
  // 选择打印机
  function selectPrinter(printer: Printer) {
    if (printer.status !== 'online') {
      ElMessage.warning('该打印机当前不可用')
      return
    }
    selectedPrinter.value = printer
  }
  
  // 更新打印参数
  function updatePrintParams(params: Partial<PrintParams>) {
    printParams.value = { ...printParams.value, ...params }
  }
  
  // 清空所有文件
  function clearFiles() {
    uploadedFiles.value = []
    selectedFile.value = null
  }
  
  return {
    // 状态
    uploadedFiles,
    printers,
    selectedFile,
    selectedPrinter,
    uploading,
    uploadProgress,
    printing,
    loadingPrinters,
    printParams,
    
    // 计算属性
    canPrint,
    onlinePrinters,
    
    // 方法
    validateFile,
    handleUpload,
    handleDeleteFile,
    loadPrinters,
    handlePrint,
    selectFile,
    selectPrinter,
    updatePrintParams,
    clearFiles
  }
}
