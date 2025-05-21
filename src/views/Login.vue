<template>
  <div class="login-page" :class="{ 'dark-mode': isDarkMode }" v-motion-fade>
    <div class="login-background">
      <div class="gradient-sphere sphere-1"></div>
      <div class="gradient-sphere sphere-2"></div>
      <div class="gradient-sphere sphere-3"></div>
    </div>

    <div class="login-container glass-panel" v-motion-slide-bottom>
      <div class="logo-section" v-motion-slide-top :delay="200">
        <img src="@/assets/img/lightidea_logo.png" alt="LightIdea Logo" class="logo-img" />
        <h1 class="app-name glow-text">{{ isArabic ? 'مناقلة' : 'Budget Transfer' }}</h1>
      </div>

      <div class="form-container" v-motion-slide-bottom :delay="300">
        <h2 class="form-title">{{ isArabic ? 'تسجيل الدخول' : 'Login' }}</h2>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="alert error glass-alert" v-if="error" v-motion-slide-right>
            {{ error }}
          </div>

          <div class="form-group" v-motion-slide-right :delay="400">
            <label for="username">{{ isArabic ? 'اسم المستخدم' : 'Username' }}</label>
            <div class="input-wrapper">
              <input
                type="text"
                id="username"
                v-model="username"
                :placeholder="isArabic ? 'أدخل اسم المستخدم' : 'Enter username'"
                required
                :class="{ 'has-error': usernameError }"
                @focus="handleInputFocus"
                @blur="handleInputBlur"
              />
              <div class="input-focus-indicator"></div>
            </div>
            <div class="error-text" v-if="usernameError">{{ usernameError }}</div>
          </div>

          <div class="form-group" v-motion-slide-right :delay="500">
            <label for="password">{{ isArabic ? 'كلمة المرور' : 'Password' }}</label>
            <div class="input-wrapper password-input-container">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                :placeholder="isArabic ? 'أدخل كلمة المرور' : 'Enter password'"
                required
                :class="{ 'has-error': passwordError }"
                @focus="handleInputFocus"
                @blur="handleInputBlur"
              />
              <div class="input-focus-indicator"></div>
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                aria-label="Toggle password visibility"
              >
                <EyeIcon v-if="!showPassword" />
                <EyeOffIcon v-else />
              </button>
            </div>
            <div class="error-text" v-if="passwordError">{{ passwordError }}</div>
          </div>

          <button
            type="submit"
            class="login-btn glow-btn"
            :disabled="isLoading"
            v-motion-slide-right
            :delay="600"
          >
            <span v-if="isLoading" class="loader"></span>
            <span v-else>{{ isArabic ? 'تسجيل الدخول' : 'Login' }}</span>
            <div class="btn-glint"></div>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

  // Animate background spheres
  animateBackgroundSpheres()
})

// Watch for theme changes
watch(
  () => themeStore.darkMode,
  (newVal) => {
    isDarkMode.value = newVal
  },
)

watch(
  () => themeStore.language,
  (newVal) => {
    isArabic.value = newVal === 'ar'
  },
)

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

  // Form validation
  let isValid = true

  if (!username.value.trim()) {
    usernameError.value = isArabic.value
      ? 'الرجاء إدخال اسم المستخدم'
      : 'Please enter your username'
    isValid = false
  }

  if (!password.value.trim()) {
    passwordError.value = isArabic.value ? 'الرجاء إدخال كلمة المرور' : 'Please enter your password'
    isValid = false
  }

  if (!isValid) return

  // Set loading state
  isLoading.value = true

  try {
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

// Micro-interactions for form inputs
function handleInputFocus(e: Event) {
  const target = e.target as HTMLElement
  const wrapper = target.closest('.input-wrapper')
  if (wrapper) {
    wrapper.classList.add('focused')
  }
}

function handleInputBlur(e: Event) {
  const target = e.target as HTMLElement
  const wrapper = target.closest('.input-wrapper')
  if (wrapper) {
    wrapper.classList.remove('focused')
    if ((target as HTMLInputElement).value) {
      wrapper.classList.add('has-value')
    } else {
      wrapper.classList.remove('has-value')
    }
  }
}

// Animate floating background spheres
function animateBackgroundSpheres() {
  const randomMovement = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const spheres = document.querySelectorAll('.gradient-sphere')

  spheres.forEach((sphere) => {
    const elem = sphere as HTMLElement
    setInterval(() => {
      const xMovement = randomMovement(-20, 20)
      const yMovement = randomMovement(-20, 20)

      elem.style.transform = `translate(${xMovement}px, ${yMovement}px)`
    }, 6000)
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-bg-light) 0%, #e4e8f0 100%);
  padding: 1rem;
  z-index: 0;
}

.login-page.dark-mode {
  background: linear-gradient(135deg, var(--color-bg-dark) 0%, #111122 100%);
  color: var(--color-text-light);
}

/* Animated background */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.gradient-sphere {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(60px);
  transition: transform 5s cubic-bezier(0.23, 1, 0.32, 1);
}

.sphere-1 {
  top: 20%;
  left: 15%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, var(--color-accent-magenta) 0%, rgba(240, 171, 252, 0) 70%);
  animation: pulse 12s ease-in-out infinite alternate;
}

.sphere-2 {
  top: 60%;
  left: 60%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--color-accent-cyan) 0%, rgba(94, 234, 212, 0) 70%);
  animation: pulse 15s ease-in-out infinite alternate-reverse;
}

.sphere-3 {
  top: 30%;
  right: 20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--color-accent-primary) 0%, rgba(109, 26, 54, 0) 70%);
  animation: pulse 18s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
}

.login-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 2;
  transition: all var(--transition-normal);
}

.glass-panel {
  background: rgba(255, 255, 255, var(--glass-opacity-light));
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-light);
  border-radius: 24px;
  box-shadow: var(--shadow-light);
  overflow: hidden;
}

.dark-mode .glass-panel {
  background: rgba(17, 17, 34, var(--glass-opacity-dark));
  border: 1px solid var(--glass-border-dark);
  box-shadow: var(--shadow-dark);
}

.logo-section {
  padding: 2rem 1rem;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.dark-mode .logo-section {
  background: linear-gradient(90deg, var(--color-accent-primary), #2a0812);
}

.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.app-name {
  font-family: var(--font-secondary);
  font-size: var(--font-size-fluid-title);
  font-weight: 700;
  color: white;
  margin: 0;
  text-align: center;
}

.glow-text {
  text-shadow: var(--shadow-glow-magenta);
}

.form-container {
  padding: 2rem;
}

.form-title {
  font-family: var(--font-secondary);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.glass-alert {
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.error {
  color: #ef4444;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.input-wrapper {
  position: relative;
  border-radius: 12px;
  transition: all var(--transition-fast);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.dark-mode .input-wrapper {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.input-wrapper.focused {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(109, 26, 54, 0.2);
}

.dark-mode .input-wrapper.focused {
  box-shadow: 0 0 0 2px rgba(240, 171, 252, 0.2);
}

.input-focus-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 0;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-magenta));
  transition: width var(--transition-normal);
}

.input-wrapper.focused .input-focus-indicator {
  width: 100%;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  font-size: 1rem;
  color: inherit;
  outline: none;
}

.password-input-container {
  display: flex;
  align-items: center;
}

.toggle-password {
  background: transparent;
  border: none;
  padding: 0.5rem;
  margin-right: 0.5rem;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.toggle-password:hover {
  opacity: 1;
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.login-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  width: 100%;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.glow-btn {
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(109, 26, 54, 0.3);
}

.dark-mode .glow-btn {
  box-shadow: var(--shadow-glow-magenta);
}

.glow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(109, 26, 54, 0.4);
}

.dark-mode .glow-btn:hover {
  box-shadow: 0 0 20px rgba(240, 171, 252, 0.5);
}

.btn-glint {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(35deg);
  transition: transform var(--transition-slow);
}

.glow-btn:hover .btn-glint {
  transform: rotate(35deg) translate(10%, 10%);
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-container {
    max-width: 100%;
  }

  .form-container {
    padding: 1.5rem;
  }
}
</style>
