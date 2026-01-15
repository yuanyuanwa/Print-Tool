// ===========================
// 类型定义
// ===========================

// 用户相关
export interface UserInfo {
  id: number
  username: string
  phone: string
  email?: string
  avatar?: string
  createTime?: string
}

export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

export interface RegisterParams {
  username: string
  phone: string
  password: string
  confirmPassword: string
  code: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

// API 响应
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 打印相关
export interface PrintFile {
  id: string
  name: string
  type: 'pdf' | 'word'
  size: number
  url: string
  uploadTime: string
}

export interface Printer {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy'
  type: string
}

export interface PrintParams {
  fileId: string
  printerId: string
  copies: number
  paperSize: 'A4' | 'A3' | 'Letter'
  orientation: 'portrait' | 'landscape'
  colorMode: 'color' | 'grayscale'
}

export interface PrintHistory {
  id: string
  fileName: string
  printerName: string
  status: 'success' | 'failed' | 'pending'
  copies: number
  printTime: string
}

// 列表数据
export interface ListItem {
  id: number
  title: string
  description: string
  status: number
  createTime: string
  updateTime: string
}

export interface ListFilter {
  keyword?: string
  status?: number
  startDate?: string
  endDate?: string
}

// 统计数据
export interface DashboardStats {
  totalPrints: number
  todayPrints: number
  totalFiles: number
  activePrinters: number
  printTrend: {
    date: string
    count: number
  }[]
  fileTypeStats: {
    type: string
    count: number
  }[]
}

// 菜单项
export interface MenuItem {
  path: string
  title: string
  icon: string
  children?: MenuItem[]
}

// 响应式设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
