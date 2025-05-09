<template>
  <div class="login-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="login-container">
      <div class="logo-section">
        <img src="@/assets/img/lightidea_logo.png" alt="LightIdea Logo" class="logo-img" />
        <h1 class="app-name">{{ isArabic ? 'مناقلة' : 'Budget Transfer' }}</h1>
      </div>

      <div class="form-container">
        <h2 class="form-title">{{ isArabic ? 'تسجيل الدخول' : 'Login' }}</h2>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="alert error" v-if="error">
            {{ error }}
          </div>

          <div class="form-group">
            <label for="username">{{ isArabic ? 'اسم المستخدم' : 'Username' }}</label>
            <input
              type="text"
              id="username"
              v-model="username"
              :placeholder="isArabic ? 'أدخل اسم المستخدم' : 'Enter username'"
              required
              :class="{ 'has-error': usernameError }"
            />
            <div class="error-text" v-if="usernameError">{{ usernameError }}</div>
          </div>

          <div class="form-group">
            <label for="password">{{ isArabic ? 'كلمة المرور' : 'Password' }}</label>
            <div class="password-input-container">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                :placeholder="isArabic ? 'أدخل كلمة المرور' : 'Enter password'"
                required
                :class="{ 'has-error': passwordError }"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <EyeIcon v-if="!showPassword" />
                <EyeOffIcon v-else />
              </button>
            </div>
            <div class="error-text" v-if="passwordError">{{ passwordError }}</div>
          </div>

          <button type="submit" class="login-btn" :disabled="isLoading">
            <span v-if="isLoading" class="loader"></span>
            <span v-else>{{ isArabic ? 'تسجيل الدخول' : 'Login' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

// Component name for debugging
defineOptions({
  name: 'LoginPage',
})

// Router for navigation after login
const router = useRouter()

// Theme and language settings
const themeStore = useThemeStore()
const isDarkMode = ref(false)
const isArabic = ref(false)

onMounted(() => {
  isDarkMode.value = themeStore.darkMode
  isArabic.value = themeStore.language === 'ar'
})

// Form state
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const usernameError = ref('')
const passwordError = ref('')
const isLoading = ref(false)

// Auth store for login functionality
const authStore = useAuthStore()

// Handle login form submission
async function handleLogin() {
  // Reset error messages
  error.value = ''
  usernameError.value = ''
  passwordError.value = ''

  // Basic validation
  if (!username.value.trim()) {
    usernameError.value = isArabic.value ? 'اسم المستخدم مطلوب' : 'Username is required'
    return
  }

  if (!password.value) {
    passwordError.value = isArabic.value ? 'كلمة المرور مطلوبة' : 'Password is required'
    return
  }

  try {
    isLoading.value = true

    // Call login API
    const response = await fetch('http://localhost:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle API error response
      error.value =
        data.message ||
        (isArabic.value
          ? 'فشل تسجيل الدخول. تحقق من اسم المستخدم وكلمة المرور.'
          : 'Login failed. Please check your username and password.')
      return
    }

    // Store auth token and user data
    await authStore.setAuth({
      token: data.token,
      user: data.data,
    })

    // Navigate to dashboard or home page
    router.push({ name: 'Dashboard' })
  } catch (err) {
    console.error('Login error:', err)
    error.value = isArabic.value
      ? 'حدث خطأ أثناء محاولة تسجيل الدخول. الرجاء المحاولة مرة أخرى.'
      : 'An error occurred while trying to log in. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding: 1rem;
}

.login-page.dark-mode {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e2e2e2;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.dark-mode .login-container {
  background-color: #222236;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

.logo-section {
  padding: 2rem 1rem;
  background: linear-gradient(90deg, #6d1a36, #4a0d20);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 60px;
  height: auto;
  margin-bottom: 0.5rem;
}

.app-name {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.form-container {
  padding: 2rem;
}

.form-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
  color: #1a202c;
}

.dark-mode .form-title {
  color: #e2e2e2;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #4a5568;
}

.dark-mode .form-group label {
  color: #a0aec0;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.2);
  outline: none;
}

.dark-mode .form-group input {
  background-color: #2d2d46;
  border-color: #3d3d56;
  color: #e2e2e2;
}

.dark-mode .form-group input:focus {
  border-color: #ff9ea0;
  box-shadow: 0 0 0 3px rgba(255, 158, 160, 0.2);
}

.form-group input.has-error {
  border-color: #e53e3e;
}

.dark-mode .form-group input.has-error {
  border-color: #fc8181;
}

.error-text {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.dark-mode .error-text {
  color: #fc8181;
}

.password-input-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .toggle-password {
  color: #a0aec0;
}

.login-btn {
  background: linear-gradient(135deg, #6d1a36, #4a0d20);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
}

.login-btn:hover {
  background: linear-gradient(135deg, #7d2a46, #5a1d30);
  transform: translateY(-1px);
}

.login-btn:active {
  transform: translateY(1px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.dark-mode .login-btn {
  background: linear-gradient(135deg, #7d2a46, #5a1d30);
}

.dark-mode .login-btn:hover {
  background: linear-gradient(135deg, #8d3a56, #6a2d40);
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.alert.error {
  background-color: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
}

.dark-mode .alert.error {
  background-color: rgba(252, 129, 129, 0.2);
  color: #fc8181;
  border: 1px solid rgba(252, 129, 129, 0.3);
}

/* Loading spinner */
.loader {
  width: 18px;
  height: 18px;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: loader-rotate 1s linear infinite;
}

@keyframes loader-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* RTL Support */
[dir='rtl'] .toggle-password {
  right: auto;
  left: 10px;
}

@media (max-width: 480px) {
  .login-container {
    max-width: 100%;
  }

  .form-container {
    padding: 1.5rem;
  }
}
</style>
