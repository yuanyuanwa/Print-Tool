<template>
  <div class="register-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="grid-lines"></div>
    </div>

    <!-- 注册卡片 -->
    <div class="register-card">
      <!-- Logo -->
      <div class="register-header">
        <div class="logo">
          <div class="logo-icon">
            <el-icon :size="32"><Printer /></el-icon>
          </div>
          <h1 class="logo-text">创建账号</h1>
        </div>
        <p class="subtitle">加入我们，体验智能打印服务</p>
      </div>

      <!-- 注册表单 -->
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号"
            size="large"
            :prefix-icon="Phone"
          />
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-input">
            <el-input
              v-model="form.code"
              placeholder="请输入验证码"
              size="large"
              :prefix-icon="Message"
            />
            <el-button 
              type="primary" 
              size="large"
              class="code-btn"
              :disabled="countdown > 0"
              :loading="sendingCode"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
            </el-button>
          </div>
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

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入密码"
            size="large"
            :prefix-icon="Lock"
          >
            <template #suffix>
              <el-icon class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                <View v-if="showConfirmPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="agreement">
          <el-checkbox v-model="form.agreement">
            我已阅读并同意
            <a href="javascript:;" class="link">《用户服务协议》</a>
            和
            <a href="javascript:;" class="link">《隐私政策》</a>
          </el-checkbox>
        </el-form-item>

        <el-button 
          type="primary" 
          size="large" 
          class="register-btn"
          :loading="loading"
          @click="handleRegister"
        >
          {{ loading ? '注册中...' : '注 册' }}
        </el-button>
      </el-form>

      <!-- 登录链接 -->
      <div class="register-footer">
        <span>已有账号？</span>
        <router-link to="/login" class="login-link">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Printer, User, Lock, View, Hide, Phone, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'
import { sendCode } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

// 验证规则
const validatePassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于 6 位'))
  } else {
    if (form.confirmPassword !== '') {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validatePhone = (_rule: any, value: string, callback: any) => {
  const phoneReg = /^1[3-9]\d{9}$/
  if (value === '') {
    callback(new Error('请输入手机号'))
  } else if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '请输入 6 位验证码', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    { 
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请阅读并同意用户协议'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 发送验证码
async function handleSendCode() {
  // 先验证手机号
  await formRef.value?.validateField('phone')
  
  sendingCode.value = true
  
  try {
    await sendCode(form.phone)
    ElMessage.success('验证码已发送')
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error('验证码发送失败')
  } finally {
    sendingCode.value = false
  }
}

// 注册
async function handleRegister() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    
    try {
      await userStore.register({
        username: form.username,
        phone: form.phone,
        code: form.code,
        password: form.password,
        confirmPassword: form.confirmPassword
      })
      
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } catch (error: any) {
      ElMessage.error(error.message || '注册失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.register-page {
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
    width: 500px;
    height: 500px;
    top: -150px;
    left: -150px;
  }
  
  &.circle-2 {
    width: 400px;
    height: 400px;
    bottom: -100px;
    right: -100px;
    animation-delay: -3s;
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

// 注册卡片
.register-card {
  max-width: 450px;
  width: 100%;
  padding: $spacing-2xl;
  @include glass-effect;
  border-radius: $radius-xl;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.6s ease-out;
  
  @include mobile {
    padding: $spacing-xl;
  }
}

.register-header {
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

.register-form {
  :deep(.el-form-item) {
    margin-bottom: $spacing-md;
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
  
  .link {
    color: $primary-color;
    
    &:hover {
      color: $primary-light;
    }
  }
  
  :deep(.el-checkbox__label) {
    color: $text-secondary;
    font-size: $font-size-sm;
  }
}

.code-input {
  display: flex;
  gap: $spacing-sm;
  width: 100%;
  
  .el-input {
    flex: 1;
  }
  
  .code-btn {
    flex-shrink: 0;
    min-width: 120px;
  }
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: $font-size-base;
  font-weight: 600;
  margin-top: $spacing-md;
}

.register-footer {
  text-align: center;
  margin-top: $spacing-xl;
  color: $text-secondary;
  font-size: $font-size-sm;
  
  .login-link {
    color: $primary-color;
    font-weight: 500;
    margin-left: $spacing-xs;
    
    &:hover {
      color: $primary-light;
    }
  }
}
</style>
