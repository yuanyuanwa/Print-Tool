// ===========================
// 认证相关 API
// ===========================

import { post } from '@/utils/request'
import type { LoginParams, RegisterParams, LoginResult, UserInfo } from '@/types'

/**
 * 用户登录
 * POST /api/auth/login
 */
export function login(data: LoginParams): Promise<LoginResult> {
  // TODO: 对接后端接口
  // return post<LoginResult>('/auth/login', data)
  
  // 模拟登录成功
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'mock_token_' + Date.now(),
        userInfo: {
          id: 1,
          username: data.username,
          phone: '138****8888',
          email: 'user@example.com',
          avatar: ''
        }
      })
    }, 1000)
  })
}

/**
 * 用户注册
 * POST /api/auth/register
 */
export function register(data: RegisterParams): Promise<void> {
  // TODO: 对接后端接口
  // return post<void>('/auth/register', data)
  
  // 模拟注册成功
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 1000)
  })
}

/**
 * 发送验证码
 * POST /api/auth/send-code
 */
export function sendCode(phone: string): Promise<void> {
  // TODO: 对接后端接口
  // return post<void>('/auth/send-code', { phone })
  
  // 模拟发送成功
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })
}

/**
 * 获取用户信息
 * GET /api/auth/user-info
 */
export function getUserInfo(): Promise<UserInfo> {
  // TODO: 对接后端接口
  // return get<UserInfo>('/auth/user-info')
  
  // 模拟获取用户信息
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        username: 'admin',
        phone: '138****8888',
        email: 'admin@example.com',
        avatar: ''
      })
    }, 500)
  })
}

/**
 * 用户登出
 * POST /api/auth/logout
 */
export function logout(): Promise<void> {
  // TODO: 对接后端接口
  // return post<void>('/auth/logout')
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 300)
  })
}
