// ===========================
// 用户状态管理
// ===========================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginParams, RegisterParams } from '@/types'
import { login as loginApi, register as registerApi, logout as logoutApi } from '@/api/auth'
import { getToken, setToken, removeToken, getUser, setUser, removeUser, getRememberInfo, setRememberInfo, removeRememberInfo } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(getToken() || '')
  const userInfo = ref<UserInfo | null>(getUser<UserInfo>())
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  
  // 登录
  async function login(params: LoginParams) {
    try {
      const result = await loginApi(params)
      
      token.value = result.token
      userInfo.value = result.userInfo
      
      setToken(result.token)
      setUser(result.userInfo)
      
      // 记住密码
      if (params.remember) {
        setRememberInfo(params.username, params.password)
      } else {
        removeRememberInfo()
      }
      
      return result
    } catch (error) {
      throw error
    }
  }
  
  // 注册
  async function register(params: RegisterParams) {
    try {
      await registerApi(params)
    } catch (error) {
      throw error
    }
  }
  
  // 登出
  async function logout() {
    try {
      await logoutApi()
    } finally {
      token.value = ''
      userInfo.value = null
      removeToken()
      removeUser()
    }
  }
  
  // 获取记住的登录信息
  function getRememberedLogin() {
    return getRememberInfo()
  }
  
  // 更新用户信息
  function updateUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      setUser(userInfo.value)
    }
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    login,
    register,
    logout,
    getRememberedLogin,
    updateUserInfo
  }
})
