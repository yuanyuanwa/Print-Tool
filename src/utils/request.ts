// ===========================
// Axios 请求封装
// ===========================

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, clearStorage } from './storage'
import type { ApiResponse } from '@/types'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message, data } = response.data

    // 根据后端约定的 code 处理
    if (code === 200 || code === 0) {
      return data
    }

    // Token 过期
    if (code === 401) {
      ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        clearStorage()
        window.location.href = '/login'
      })
      return Promise.reject(new Error(message || '登录已过期'))
    }

    // 其他错误
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    console.error('响应错误:', error)
    
    let message = '网络错误，请稍后重试'
    
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请登录'
          clearStorage()
          window.location.href = '/login'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败 (${status})`
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// 封装请求方法
export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service(config) as Promise<T>
}

export function get<T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'get', url, params, ...config })
}

export function post<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'post', url, data, ...config })
}

export function put<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'put', url, data, ...config })
}

export function del<T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'delete', url, params, ...config })
}

// 上传文件
export function upload<T = any>(url: string, file: File, onProgress?: (percent: number) => void): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)

  return request<T>({
    method: 'post',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    }
  })
}

export default service
