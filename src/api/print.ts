// ===========================
// 打印相关 API
// ===========================

import { get, post, upload } from '@/utils/request'
import type { PrintFile, Printer, PrintParams, PrintHistory, PageResult, PageParams } from '@/types'

/**
 * 上传文件
 * POST /api/print/upload
 */
export function uploadFile(file: File, onProgress?: (percent: number) => void): Promise<PrintFile> {
  // TODO: 对接后端接口
  // return upload<PrintFile>('/print/upload', file, onProgress)
  
  // 模拟上传
  return new Promise((resolve) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      if (onProgress) {
        onProgress(Math.min(progress, 100))
      }
      if (progress >= 100) {
        clearInterval(interval)
        resolve({
          id: 'file_' + Date.now(),
          name: file.name,
          type: file.name.endsWith('.pdf') ? 'pdf' : 'word',
          size: file.size,
          url: URL.createObjectURL(file),
          uploadTime: new Date().toISOString()
        })
      }
    }, 200)
  })
}

/**
 * 获取打印机列表
 * GET /api/print/printers
 */
export function getPrinters(): Promise<Printer[]> {
  // TODO: 对接后端接口
  // return get<Printer[]>('/print/printers')
  
  // 模拟打印机列表
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', name: 'HP LaserJet Pro', status: 'online', type: '激光打印机' },
        { id: '2', name: 'Canon PIXMA', status: 'online', type: '喷墨打印机' },
        { id: '3', name: 'Epson WorkForce', status: 'offline', type: '多功能一体机' },
        { id: '4', name: 'Brother HL-L2350', status: 'busy', type: '激光打印机' }
      ])
    }, 500)
  })
}

/**
 * 执行打印
 * POST /api/print/execute
 */
export function executePrint(params: PrintParams): Promise<{ jobId: string }> {
  // TODO: 对接后端接口
  // return post<{ jobId: string }>('/print/execute', params)
  
  // 模拟打印
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        jobId: 'job_' + Date.now()
      })
    }, 1500)
  })
}

/**
 * 获取文件预览
 * GET /api/print/preview/:id
 */
export function getFilePreview(fileId: string): Promise<{ url: string; pages: number }> {
  // TODO: 对接后端接口
  // return get<{ url: string; pages: number }>(`/print/preview/${fileId}`)
  
  // 模拟预览
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url: '',
        pages: 5
      })
    }, 500)
  })
}

/**
 * 获取打印历史
 * GET /api/print/history
 */
export function getPrintHistory(params: PageParams): Promise<PageResult<PrintHistory>> {
  // TODO: 对接后端接口
  // return get<PageResult<PrintHistory>>('/print/history', params)
  
  // 模拟历史记录
  return new Promise((resolve) => {
    setTimeout(() => {
      const list: PrintHistory[] = []
      for (let i = 1; i <= 10; i++) {
        list.push({
          id: String(i),
          fileName: `文档${i}.pdf`,
          printerName: 'HP LaserJet Pro',
          status: i % 3 === 0 ? 'failed' : 'success',
          copies: Math.floor(Math.random() * 5) + 1,
          printTime: new Date(Date.now() - i * 3600000).toISOString()
        })
      }
      resolve({
        list,
        total: 50,
        page: params.page,
        pageSize: params.pageSize
      })
    }, 500)
  })
}

/**
 * 删除上传的文件
 * DELETE /api/print/file/:id
 */
export function deleteFile(fileId: string): Promise<void> {
  // TODO: 对接后端接口
  // return del<void>(`/print/file/${fileId}`)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })
}
