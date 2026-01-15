// ===========================
// 路由配置
// ===========================

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils/storage'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/Index.vue'),
        meta: {
          title: '首页',
          icon: 'HomeFilled',
          requiresAuth: true
        }
      },
      {
        path: 'print',
        name: 'Print',
        component: () => import('@/views/print/Index.vue'),
        meta: {
          title: '打印中心',
          icon: 'Printer',
          requiresAuth: true
        }
      },
      {
        path: 'list',
        name: 'List',
        component: () => import('@/views/list/Index.vue'),
        meta: {
          title: '数据列表',
          icon: 'List',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '打印管理系统'} - 打印管理系统`
  
  const token = getToken()
  const requiresAuth = to.meta.requiresAuth !== false
  
  if (requiresAuth && !token) {
    // 需要登录但未登录，跳转到登录页
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (!requiresAuth && token && (to.path === '/login' || to.path === '/register')) {
    // 已登录，访问登录/注册页面，跳转到首页
    next('/home')
  } else {
    next()
  }
})

export default router

// 菜单配置（用于导航栏）
export const menuList = [
  {
    path: '/home',
    title: '首页',
    icon: 'HomeFilled'
  },
  {
    path: '/print',
    title: '打印中心',
    icon: 'Printer'
  },
  {
    path: '/list',
    title: '数据列表',
    icon: 'List'
  }
]
