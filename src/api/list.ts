// ===========================
// 列表相关 API
// ===========================

import { get, post, put, del } from '@/utils/request'
import type { ListItem, ListFilter, PageParams, PageResult } from '@/types'

/**
 * 获取列表数据
 * GET /api/list/data
 */
export function getListData(params: PageParams & ListFilter): Promise<PageResult<ListItem>> {
  // TODO: 对接后端接口
  // return get<PageResult<ListItem>>('/list/data', params)
  
  // 模拟列表数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const list: ListItem[] = []
      const total = 86
      const start = (params.page - 1) * params.pageSize
      const end = Math.min(start + params.pageSize, total)
      
      for (let i = start; i < end; i++) {
        list.push({
          id: i + 1,
          title: `数据项 ${i + 1}`,
          description: `这是第 ${i + 1} 条数据的详细描述信息，用于展示列表内容。`,
          status: i % 3,
          createTime: new Date(Date.now() - i * 86400000).toISOString(),
          updateTime: new Date(Date.now() - i * 43200000).toISOString()
        })
      }
      
      resolve({
        list,
        total,
        page: params.page,
        pageSize: params.pageSize
      })
    }, 600)
  })
}

/**
 * 获取详情
 * GET /api/list/detail/:id
 */
export function getListDetail(id: number): Promise<ListItem> {
  // TODO: 对接后端接口
  // return get<ListItem>(`/list/detail/${id}`)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: `数据项 ${id}`,
        description: `这是第 ${id} 条数据的详细描述信息。`,
        status: id % 3,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      })
    }, 300)
  })
}

/**
 * 创建数据
 * POST /api/list/create
 */
export function createListItem(data: Partial<ListItem>): Promise<ListItem> {
  // TODO: 对接后端接口
  // return post<ListItem>('/list/create', data)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        title: data.title || '',
        description: data.description || '',
        status: data.status || 0,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      })
    }, 500)
  })
}

/**
 * 更新数据
 * PUT /api/list/update/:id
 */
export function updateListItem(id: number, data: Partial<ListItem>): Promise<ListItem> {
  // TODO: 对接后端接口
  // return put<ListItem>(`/list/update/${id}`, data)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: data.title || '',
        description: data.description || '',
        status: data.status || 0,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      })
    }, 500)
  })
}

/**
 * 删除数据
 * DELETE /api/list/delete/:id
 */
export function deleteListItem(id: number): Promise<void> {
  // TODO: 对接后端接口
  // return del<void>(`/list/delete/${id}`)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })
}

/**
 * 批量删除
 * POST /api/list/batch-delete
 */
export function batchDeleteListItems(ids: number[]): Promise<void> {
  // TODO: 对接后端接口
  // return post<void>('/list/batch-delete', { ids })
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })
}
