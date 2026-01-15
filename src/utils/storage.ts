// ===========================
// 本地存储工具
// ===========================

const TOKEN_KEY = 'print_system_token'
const USER_KEY = 'print_system_user'
const REMEMBER_KEY = 'print_system_remember'

// Token 相关
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// 用户信息相关
export function getUser<T>(): T | null {
  const user = localStorage.getItem(USER_KEY)
  if (user) {
    try {
      return JSON.parse(user) as T
    } catch {
      return null
    }
  }
  return null
}

export function setUser<T>(user: T): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function removeUser(): void {
  localStorage.removeItem(USER_KEY)
}

// 记住密码
export function getRememberInfo(): { username: string; password: string } | null {
  const info = localStorage.getItem(REMEMBER_KEY)
  if (info) {
    try {
      return JSON.parse(info)
    } catch {
      return null
    }
  }
  return null
}

export function setRememberInfo(username: string, password: string): void {
  localStorage.setItem(REMEMBER_KEY, JSON.stringify({ username, password }))
}

export function removeRememberInfo(): void {
  localStorage.removeItem(REMEMBER_KEY)
}

// 清除所有存储
export function clearStorage(): void {
  removeToken()
  removeUser()
}

// 通用存储方法
export function getItem<T>(key: string): T | null {
  const item = localStorage.getItem(key)
  if (item) {
    try {
      return JSON.parse(item) as T
    } catch {
      return item as unknown as T
    }
  }
  return null
}

export function setItem<T>(key: string, value: T): void {
  if (typeof value === 'string') {
    localStorage.setItem(key, value)
  } else {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(key)
}
