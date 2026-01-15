// ===========================
// 首页仪表盘 API
// ===========================

import { get } from '@/utils/request'
import type { DashboardStats } from '@/types'

/**
 * 获取统计数据
 * GET /api/dashboard/stats
 */
export function getDashboardStats(): Promise<DashboardStats> {
  // TODO: 对接后端接口
  // return get<DashboardStats>('/dashboard/stats')
  
  // 模拟统计数据
  return new Promise((resolve) => {
    setTimeout(() => {
      // 生成最近7天的趋势数据
      const printTrend = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        printTrend.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 100) + 20
        })
      }
      
      resolve({
        totalPrints: 1256,
        todayPrints: 42,
        totalFiles: 328,
        activePrinters: 3,
        printTrend,
        fileTypeStats: [
          { type: 'PDF', count: 180 },
          { type: 'Word', count: 120 },
          { type: '其他', count: 28 }
        ]
      })
    }, 800)
  })
}
