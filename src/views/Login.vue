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
import apiService from '@/services/apiService'

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
    // Call login API using centralized apiService
    const data = await apiService.auth.login({
      username: username.value,
      password: password.value,
    })

    // Note: apiService throws errors for non-200 responses,
    // so we won't have to check response.ok

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
  background: linear-gradient(135deg, #f8f6f8 0%, #fff6fa 35%, #f0e8f2 70%, #e8d5e8 100%);
  padding: 1rem;
  z-index: 0;
}

.login-page.dark-mode {
  background: linear-gradient(135deg, #1a1623 0%, #241726 35%, #2d1b32 70%, #362040 100%);
  color: #f8e9f0;
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
  opacity: 0.4;
  filter: blur(40px);
  transition: transform 5s cubic-bezier(0.23, 1, 0.32, 1);
}

.sphere-1 {
  top: 20%;
  left: 15%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #e14b6a 0%, rgba(225, 75, 106, 0) 70%);
  animation: pulse 12s ease-in-out infinite alternate;
}

.sphere-2 {
  top: 60%;
  left: 60%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #8a2a44 0%, rgba(138, 42, 68, 0) 70%);
  animation: pulse 15s ease-in-out infinite alternate-reverse;
}

.sphere-3 {
  top: 30%;
  right: 20%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, #d946ef 0%, rgba(217, 70, 239, 0) 70%);
  animation: pulse 18s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.2;
  }
}

.login-container {
  width: 100%;
  max-width: 520px;
  position: relative;
  z-index: 2;
  transition: all var(--transition-normal);
  border-radius: 20px;
  border: 2px solid rgba(225, 75, 106, 0.2);
  box-shadow:
    0 20px 60px rgba(138, 42, 68, 0.15),
    0 8px 25px rgba(0, 0, 0, 0.1);
}

.glass-panel {
  background: rgba(255, 246, 250, 0.9);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(228, 201, 214, 0.4);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(138, 42, 68, 0.15);
  overflow: hidden;
}

.dark-mode .glass-panel {
  background: rgba(36, 23, 38, 0.9);
  border: 2px solid rgba(81, 32, 60, 0.4);
  box-shadow: 0 20px 60px rgba(167, 56, 92, 0.15);
}

.logo-section {
  padding: 2.5rem 1rem;
  background: linear-gradient(135deg, #fff6fa 0%, #f8f6f8 50%, #f0e8f2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(225, 75, 106, 0.2);
}

.logo-section::before {
  content: '$';
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 24px;
  color: rgba(225, 75, 106, 0.3);
  font-weight: bold;
  animation: float 3s ease-in-out infinite;
}

.logo-section::after {
  content: '€';
  position: absolute;
  bottom: 15px;
  left: 25px;
  font-size: 20px;
  color: rgba(138, 42, 68, 0.3);
  font-weight: bold;
  animation: float 4s ease-in-out infinite reverse;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.dark-mode .logo-section {
  background: linear-gradient(135deg, #2d1b32 0%, #241726 100%);
}

.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 12px rgba(225, 75, 106, 0.3));
}

.app-name {
  font-family: var(--font-secondary);
  font-size: var(--font-size-fluid-title);
  font-weight: 700;
  color: #6d1a36;
  margin: 0;
  text-align: center;
  letter-spacing: 0.5px;
}

.dark-mode .app-name {
  color: #f8e9f0;
}

.glow-text {
  text-shadow: 0 2px 10px rgba(225, 75, 106, 0.3);
}

.form-container {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 246, 250, 0.8), rgba(240, 232, 242, 0.6));
  position: relative;
}

.dark-mode .form-container {
  background: linear-gradient(135deg, rgba(36, 23, 38, 0.8), rgba(45, 27, 50, 0.6));
}

.form-container::before {
  content: '';
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="%23e14b6a" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.59 10.75C10.21 11.13 10.21 11.75 10.59 12.13L11.83 13.37L5.12 20.08C4.73 20.47 4.73 21.1 5.12 21.49C5.51 21.88 6.14 21.88 6.53 21.49L13.24 14.78L14.48 16.02C14.86 16.4 15.48 16.4 15.86 16.02L21.41 10.47L19 8.06L21 9Z"/></svg>')
    no-repeat center;
  background-size: contain;
  opacity: 0.1;
}

.form-title {
  font-family: var(--font-secondary);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #6d1a36;
  text-shadow: 0 1px 3px rgba(225, 75, 106, 0.2);
}

.dark-mode .form-title {
  color: #f8e9f0;
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
  color: #dc2626;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #8a2a44;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark-mode .form-group label {
  color: #e14b6a;
}

.input-wrapper {
  position: relative;
  border-radius: 12px;
  transition: all var(--transition-fast);
  background: rgba(255, 246, 250, 0.7);
  border: 2px solid rgba(228, 201, 214, 0.4);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(138, 42, 68, 0.1);
}

.dark-mode .input-wrapper {
  background: rgba(36, 23, 38, 0.8);
  border: 2px solid rgba(81, 32, 60, 0.4);
}

.input-wrapper.focused {
  border-color: #e14b6a;
  box-shadow:
    0 0 0 3px rgba(225, 75, 106, 0.2),
    0 4px 15px rgba(225, 75, 106, 0.2);
  transform: translateY(-2px);
}

.dark-mode .input-wrapper.focused {
  box-shadow:
    0 0 0 3px rgba(225, 75, 106, 0.3),
    0 4px 15px rgba(225, 75, 106, 0.2);
}

.input-focus-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 0;
  background: linear-gradient(90deg, #e14b6a, #d946ef);
  transition: width var(--transition-normal);
  box-shadow: 0 0 8px rgba(225, 75, 106, 0.6);
}

.input-wrapper.focused .input-focus-indicator {
  width: 100%;
}

.input-wrapper input {
  width: 100%;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  font-size: 1rem;
  color: #6d1a36;
  outline: none;
  caret-color: #e14b6a;
  font-weight: 500;
}

.dark-mode .input-wrapper input {
  color: #f8e9f0;
}

.input-wrapper input::placeholder {
  color: rgba(109, 26, 54, 0.5);
}

.dark-mode .input-wrapper input::placeholder {
  color: rgba(248, 233, 240, 0.5);
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
  color: #e14b6a;
  opacity: 0.7;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-password:hover {
  opacity: 1;
  color: #8a2a44;
  transform: scale(1.1);
}

.dark-mode .toggle-password:hover {
  color: #f8e9f0;
}

.error-text {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.login-btn {
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  width: 100%;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.glow-btn {
  background: linear-gradient(135deg, #e14b6a 0%, #8a2a44 50%, #6d1a36 100%);
  color: white;
  border: none;
  box-shadow:
    0 8px 25px rgba(225, 75, 106, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark-mode .glow-btn {
  box-shadow:
    0 8px 30px rgba(225, 75, 106, 0.5),
    0 4px 15px rgba(0, 0, 0, 0.1);
}

.glow-btn:hover {
  transform: translateY(-3px);
  box-shadow:
    0 12px 35px rgba(225, 75, 106, 0.5),
    0 6px 20px rgba(0, 0, 0, 0.1);
}

.dark-mode .glow-btn:hover {
  box-shadow:
    0 15px 40px rgba(225, 75, 106, 0.6),
    0 8px 25px rgba(0, 0, 0, 0.1);
}

.btn-glint {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.2);
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

/* Money transfer pattern in background */
.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(225, 75, 106, 0.05) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(138, 42, 68, 0.05) 2px, transparent 2px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: -1;
}

/* Floating money symbols */
.login-page::after {
  content: '💰';
  position: absolute;
  top: 15%;
  right: 10%;
  font-size: 2rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
  z-index: 1;
}

/* Additional money transfer effects */
.form-container::after {
  content: '→';
  position: absolute;
  bottom: 20px;
  left: 20px;
  font-size: 20px;
  color: rgba(225, 75, 106, 0.3);
  font-weight: bold;
  animation: slide 3s ease-in-out infinite;
}

@keyframes slide {
  0%,
  100% {
    transform: translateX(0px);
  }
  50% {
    transform: translateX(10px);
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
