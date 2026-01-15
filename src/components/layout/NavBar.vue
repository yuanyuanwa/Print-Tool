<template>
  <header class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-logo" @click="goHome">
        <div class="logo-icon">
          <el-icon :size="28"><Printer /></el-icon>
        </div>
        <span class="logo-text" v-if="!isMobile">打印管理系统</span>
      </div>

      <!-- PC端菜单 -->
      <nav class="navbar-menu" v-if="!isMobile">
        <router-link
          v-for="item in menuList"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </router-link>
      </nav>

      <!-- 右侧操作区 -->
      <div class="navbar-actions">
        <!-- 用户信息 -->
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              {{ username.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="user-name" v-if="!isMobile">{{ username }}</span>
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 移动端菜单按钮 -->
        <button class="menu-toggle" v-if="isMobile" @click="toggleMenu">
          <el-icon :size="24"><Menu /></el-icon>
        </button>
      </div>
    </div>

    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-model="menuVisible"
      direction="rtl"
      size="70%"
      :show-close="false"
      class="mobile-drawer"
    >
      <template #header>
        <div class="drawer-header">
          <div class="logo-icon">
            <el-icon :size="24"><Printer /></el-icon>
          </div>
          <span>打印管理系统</span>
        </div>
      </template>
      <nav class="mobile-menu">
        <router-link
          v-for="item in menuList"
          :key="item.path"
          :to="item.path"
          class="mobile-menu-item"
          :class="{ active: isActive(item.path) }"
          @click="closeMenu"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </router-link>
      </nav>
    </el-drawer>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { 
  Printer, 
  ArrowDown, 
  User, 
  SwitchButton, 
  Menu, 
  HomeFilled, 
  List 
} from '@element-plus/icons-vue'
import { useUserStore, useAppStore } from '@/stores'
import { useResponsive } from '@/hooks/useResponsive'
import { menuList } from '@/router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()
const { isMobile } = useResponsive()

const username = computed(() => userStore.username || '用户')
const menuVisible = computed({
  get: () => appStore.menuVisible,
  set: (val) => val ? appStore.toggleMenu() : appStore.closeMenu()
})

function goHome() {
  router.push('/home')
}

function isActive(path: string) {
  return route.path === path
}

function toggleMenu() {
  appStore.toggleMenu()
}

function closeMenu() {
  appStore.closeMenu()
}

function handleCommand(command: string) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
    })
  } else if (command === 'profile') {
    // TODO: 跳转到个人中心
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid $border-light;
  z-index: $z-fixed;
}

.navbar-container {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @include mobile {
    padding: 0 $spacing-md;
  }
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: pointer;
  
  .logo-icon {
    width: 40px;
    height: 40px;
    @include flex-center;
    background: $gradient-primary;
    border-radius: $radius-md;
    color: $text-white;
  }
  
  .logo-text {
    font-size: $font-size-lg;
    font-weight: 700;
    @include text-gradient;
  }
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    border-radius: $radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    transition: all $transition-normal;
    
    &:hover {
      color: $text-primary;
      background: rgba($primary-color, 0.1);
    }
    
    &.active {
      color: $primary-color;
      background: rgba($primary-color, 0.15);
    }
  }
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-full;
  cursor: pointer;
  transition: all $transition-normal;
  
  &:hover {
    background: rgba($primary-color, 0.1);
  }
  
  .user-avatar {
    background: $gradient-primary;
    color: $text-white;
    font-weight: 600;
  }
  
  .user-name {
    color: $text-primary;
    font-size: $font-size-sm;
  }
  
  .arrow-icon {
    color: $text-muted;
    font-size: 12px;
  }
}

.menu-toggle {
  width: 40px;
  height: 40px;
  @include flex-center;
  background: rgba($primary-color, 0.1);
  border-radius: $radius-md;
  color: $text-primary;
  transition: all $transition-normal;
  
  &:hover {
    background: rgba($primary-color, 0.2);
  }
}

// 移动端抽屉样式
:deep(.mobile-drawer) {
  .el-drawer {
    background: $bg-dark !important;
  }
  
  .el-drawer__header {
    margin-bottom: 0;
    padding: $spacing-md;
    border-bottom: 1px solid $border-light;
  }
  
  .el-drawer__body {
    padding: $spacing-md;
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  color: $text-primary;
  font-weight: 600;
  
  .logo-icon {
    width: 36px;
    height: 36px;
    @include flex-center;
    background: $gradient-primary;
    border-radius: $radius-md;
    color: $text-white;
  }
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  
  .mobile-menu-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    border-radius: $radius-md;
    color: $text-secondary;
    font-size: $font-size-base;
    transition: all $transition-normal;
    
    &:hover,
    &.active {
      color: $primary-color;
      background: rgba($primary-color, 0.1);
    }
  }
}
</style>
