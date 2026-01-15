// ===========================
// 打印工具函数
// ===========================

import printJS from 'print-js'

export interface PrintOptions {
  type?: 'pdf' | 'html' | 'image' | 'raw-html'
  documentTitle?: string
  header?: string
  headerStyle?: string
  maxWidth?: number
  properties?: { field: string; displayName: string }[]
  gridStyle?: string
  gridHeaderStyle?: string
}

/**
 * 打印 PDF 文件
 * @param url PDF 文件 URL
 * @param options 打印选项
 */
export function printPdf(url: string, options?: PrintOptions): void {
  printJS({
    printable: url,
    type: 'pdf',
    ...options
  })
}

/**
 * 打印 HTML 元素
 * @param elementId 元素 ID
 * @param options 打印选项
 */
export function printHtml(elementId: string, options?: PrintOptions): void {
  printJS({
    printable: elementId,
    type: 'html',
    targetStyles: ['*'],
    ...options
  })
}

/**
 * 打印图片
 * @param imageUrl 图片 URL
 * @param options 打印选项
 */
export function printImage(imageUrl: string | string[], options?: PrintOptions): void {
  printJS({
    printable: imageUrl,
    type: 'image',
    ...options
  })
}

/**
 * 打印 JSON 数据为表格
 * @param data JSON 数据
 * @param properties 表格列配置
 * @param options 打印选项
 */
export function printJson(
  data: object[],
  properties: { field: string; displayName: string }[],
  options?: PrintOptions
): void {
  printJS({
    printable: data,
    type: 'json',
    properties,
    gridStyle: 'border: 1px solid #ddd; padding: 8px;',
    gridHeaderStyle: 'background: #8B5CF6; color: white; border: 1px solid #8B5CF6; padding: 8px;',
    ...options
  })
}

/**
 * 使用系统打印对话框打印
 */
export function systemPrint(): void {
  window.print()
}

/**
 * 创建打印预览窗口
 * @param content HTML 内容
 * @param styles 样式
 */
export function createPrintPreview(content: string, styles?: string): Window | null {
  const printWindow = window.open('', '_blank')
  
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>打印预览</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            ${styles || ''}
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `)
    printWindow.document.close()
  }
  
  return printWindow
}

/**
 * 检测浏览器打印支持
 */
export function checkPrintSupport(): boolean {
  return typeof window.print === 'function'
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param acceptTypes 允许的文件类型
 */
export function validateFileType(file: File, acceptTypes: string[]): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  return acceptTypes.some(type => {
    if (type.startsWith('.')) {
      return type.slice(1).toLowerCase() === extension
    }
    return file.type.includes(type)
  })
}

/**
 * 获取文件类型图标
 * @param fileName 文件名
 */
export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  
  const iconMap: Record<string, string> = {
    pdf: 'Document',
    doc: 'Document',
    docx: 'Document',
    xls: 'Grid',
    xlsx: 'Grid',
    ppt: 'PictureFilled',
    pptx: 'PictureFilled',
    jpg: 'Picture',
    jpeg: 'Picture',
    png: 'Picture',
    gif: 'Picture'
  }
  
  return iconMap[extension] || 'Document'
}
