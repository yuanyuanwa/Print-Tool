<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <NavBar />
    
    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 -->
    <footer class="main-footer">
      <p>© 2024 打印管理系统 - 科技赋能高效办公</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import NavBar from './NavBar.vue'
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $gradient-bg;
  
  // 科技感背景装饰
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 10% 20%, rgba($primary-color, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba($primary-dark, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba($primary-light, 0.05) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
}

.main-content {
  flex: 1;
  margin-top: 60px; // NavBar 高度
  position: relative;
  z-index: 1;
}

.main-footer {
  padding: $spacing-lg;
  text-align: center;
  color: $text-muted;
  font-size: $font-size-sm;
  border-top: 1px solid $border-light;
  background: rgba($bg-darker, 0.5);
  position: relative;
  z-index: 1;
}

// 页面切换动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
