<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="grid-lines"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-container">
      <div class="login-card">
        <!-- Logo -->
        <div class="login-header">
          <div class="logo">
            <div class="logo-icon">
              <el-icon :size="32"><Printer /></el-icon>
            </div>
            <h1 class="logo-text">打印管理系统测试</h1>
          </div>
          <p class="subtitle">科技赋能高效办公</p>
        </div>

        <!-- 登录表单 -->
        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
            >
              <template #suffix>
                <el-icon class="password-toggle" @click="showPassword = !showPassword">
                  <View v-if="showPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="form.remember">记住密码</el-checkbox>
            <a href="javascript:;" class="forgot-link">忘记密码？</a>
          </div>

          <el-button 
            type="primary" 
            size="large" 
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form>

        <!-- 注册链接 -->
        <div class="login-footer">
          <span>还没有账号？</span>
          <router-link to="/register" class="register-link">立即注册</router-link>
        </div>
      </div>

      <!-- 右侧装饰 -->
      <div class="login-decoration" v-if="!isMobile">
        <div class="decoration-content">
          <div class="floating-card card-1">
            <el-icon :size="24"><Document /></el-icon>
            <span>PDF 打印</span>
          </div>
          <div class="floating-card card-2">
            <el-icon :size="24"><Printer /></el-icon>
            <span>智能打印</span>
          </div>
          <div class="floating-card card-3">
            <el-icon :size="24"><DataAnalysis /></el-icon>
            <span>数据统计</span>
          </div>
          <div class="center-icon">
            <el-icon :size="80"><Printer /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Printer, User, Lock, View, Hide, Document, DataAnalysis } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'
import { useResponsive } from '@/hooks/useResponsive'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { isMobile } = useResponsive()

const formRef = ref<FormInstance>()
const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 初始化记住的登录信息
onMounted(() => {
  const remembered = userStore.getRememberedLogin()
  if (remembered) {
    form.username = remembered.username
    form.password = remembered.password
    form.remember = true
  }
})

async function handleLogin() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    
    try {
      await userStore.login({
        username: form.username,
        password: form.password,
        remember: form.remember
      })
      
      ElMessage.success('登录成功')
      
      // 跳转到之前的页面或首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/home')
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  @include flex-center;
  background: $gradient-bg;
  position: relative;
  overflow: hidden;
  padding: $spacing-md;
}

// 背景装饰
.bg-decoration {
  @include absolute-fill;
  pointer-events: none;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba($primary-color, 0.3) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
  
  &.circle-1 {
    width: 600px;
    height: 600px;
    top: -200px;
    right: -200px;
  }
  
  &.circle-2 {
    width: 400px;
    height: 400px;
    bottom: -100px;
    left: -100px;
    animation-delay: -2s;
  }
  
  &.circle-3 {
    width: 300px;
    height: 300px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: -4s;
    opacity: 0.5;
  }
}

.grid-lines {
  @include absolute-fill;
  background-image: 
    linear-gradient(rgba($primary-color, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba($primary-color, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

// 登录容器
.login-container {
  display: flex;
  align-items: stretch;
  max-width: 1000px;
  width: 100%;
  position: relative;
  z-index: 1;
  
  @include mobile {
    flex-direction: column;
  }
}

// 登录卡片
.login-card {
  flex: 1;
  max-width: 450px;
  padding: $spacing-2xl;
  @include glass-effect;
  border-radius: $radius-xl;
  animation: fadeIn 0.6s ease-out;
  
  @include mobile {
    max-width: 100%;
    padding: $spacing-xl;
  }
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  .logo {
    @include flex-center;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;
    
    .logo-icon {
      width: 56px;
      height: 56px;
      @include flex-center;
      background: $gradient-primary;
      border-radius: $radius-lg;
      color: $text-white;
      box-shadow: $shadow-glow;
    }
    
    .logo-text {
      font-size: $font-size-2xl;
      font-weight: 700;
      @include text-gradient;
    }
  }
  
  .subtitle {
    color: $text-muted;
    font-size: $font-size-sm;
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: $spacing-lg;
  }
  
  :deep(.el-input__wrapper) {
    padding: 4px 15px;
  }
  
  .password-toggle {
    cursor: pointer;
    color: $text-muted;
    transition: color $transition-fast;
    
    &:hover {
      color: $primary-color;
    }
  }
}

.form-options {
  @include flex-between;
  margin-bottom: $spacing-lg;
  
  :deep(.el-checkbox__label) {
    color: $text-secondary;
  }
  
  .forgot-link {
    font-size: $font-size-sm;
    color: $primary-color;
    
    &:hover {
      color: $primary-light;
    }
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: $font-size-base;
  font-weight: 600;
}

.login-footer {
  text-align: center;
  margin-top: $spacing-xl;
  color: $text-secondary;
  font-size: $font-size-sm;
  
  .register-link {
    color: $primary-color;
    font-weight: 500;
    margin-left: $spacing-xs;
    
    &:hover {
      color: $primary-light;
    }
  }
}

// 右侧装饰
.login-decoration {
  flex: 1;
  @include flex-center;
  position: relative;
  margin-left: $spacing-2xl;
}

.decoration-content {
  position: relative;
  width: 300px;
  height: 300px;
}

.floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  @include glass-effect;
  border-radius: $radius-md;
  color: $text-primary;
  font-size: $font-size-sm;
  animation: float 4s ease-in-out infinite;
  
  &.card-1 {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    animation-delay: 0s;
  }
  
  &.card-2 {
    bottom: 20%;
    left: 0;
    animation-delay: -1.5s;
  }
  
  &.card-3 {
    bottom: 20%;
    right: 0;
    animation-delay: -3s;
  }
  
  .el-icon {
    color: $primary-color;
  }
}

.center-icon {
  @include absolute-center;
  width: 160px;
  height: 160px;
  @include flex-center;
  background: $gradient-primary;
  border-radius: 50%;
  color: $text-white;
  box-shadow: $shadow-glow;
  animation: pulse-glow 3s ease-in-out infinite;
}
</style>
