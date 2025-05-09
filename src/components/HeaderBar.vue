<!-- HeaderBar.vue -->
<template>
  <header class="header" :class="{ 'dark-theme': isDarkMode }">
    <!-- logo + title -->
    <div class="left">
      <img src="@/assets/img/lightidea_logo.png" alt="LightIdea Logo" class="logo-img" />
      <h1 class="logo-text">{{ isArabic ? 'مناقلة' : 'Budget Transfer' }}</h1>
    </div>

    <!-- action icons -->
    <div class="actions">
      <!-- Username display -->
      <span class="username">{{ username }}</span>

      <!-- Language Toggle -->
      <div class="toggle-container">
        <span class="toggle-label">{{ isArabic ? 'EN' : 'AR' }}</span>
        <label class="switch">
          <input type="checkbox" v-model="isArabic" @change="toggleLanguage" />
          <span class="slider"></span>
        </label>
      </div>

      <!-- Dark Mode Toggle -->
      <div class="toggle-container">
        <span class="toggle-label">{{ isDarkMode ? '☀️' : '🌙' }}</span>
        <label class="switch">
          <input type="checkbox" v-model="isDarkMode" @change="toggleDarkMode" />
          <span class="slider"></span>
        </label>
      </div>

      <button class="icon bell">
        <BellIcon />
        <span class="badge"></span>
      </button>
      <!-- Logout Button -->
      <button class="icon logout" @click="logout">
        <LogOutIcon />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { BellIcon, LogOutIcon } from 'lucide-vue-next'
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const router = useRouter()

const isDarkMode = ref(false)
const isArabic = ref(false)
const username = computed(() => authStore.user?.username || '')

onMounted(() => {
  isDarkMode.value = themeStore.darkMode
  isArabic.value = themeStore.language === 'ar'
})

function toggleDarkMode() {
  themeStore.setDarkMode(isDarkMode.value)
}

function toggleLanguage() {
  themeStore.setLanguage(isArabic.value ? 'ar' : 'en')
}

async function logout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: linear-gradient(90deg, #6d1a36, #4a0d20); /* Dark maroon gradient */
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header.dark-theme {
  background: linear-gradient(90deg, #3c0d1c, #2a0712); /* Darker maroon for dark mode */
}

/* <-- clean left block --> */
.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* your existing logo/text styles */
.logo-img {
  width: 32px;
  height: auto;
}

.logo-text {
  font-weight: 700;
  font-size: 20px;
  background: linear-gradient(90deg, #fafafa, #e5e7eb);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* --- right block --- */
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  transition:
    transform 0.15s,
    opacity 0.15s;
}

.icon:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.icon:active {
  transform: translateY(1px);
}

.bell {
  position: relative;
}

.badge {
  position: absolute;
  right: 3px;
  top: 3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff9800; /* Adjusted to a warmer orange */
  animation: pulse 2s infinite;
}

.logout {
  color: #ffcccb;
}

/* Toggle switches */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-label {
  font-size: 12px;
  font-weight: bold;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #ff9800;
}

input:focus + .slider {
  box-shadow: 0 0 1px #ff9800;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

@keyframes pulse {
  50% {
    transform: scale(1.3);
  }
}

.username {
  font-size: 0.9rem;
  font-weight: 500;
  padding-right: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 12px;
}

[dir='rtl'] .username {
  padding-right: 0;
  padding-left: 12px;
  border-right: none;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 0;
  margin-left: 12px;
}
</style>
