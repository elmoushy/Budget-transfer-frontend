<!-- HeaderBar.vue -->
<template>
  <header class="header" :class="{ 'dark-theme': isDarkMode }">
    <!-- logo + title -->
    <div class="left">
      <img src="@/assets/img/lightidea_logo.png" alt="LightIdea Logo" class="logo-img" />
      <h1 class="logo-text" style="transform: translateY(12px) !important">
        {{ isArabic ? 'مناقلة' : 'Budget Transfer' }}
      </h1>
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

      <div class="notification-container">
        <button class="icon bell" @click="toggleNotifications">
          <BellIcon />
          <span v-if="hasUnreadNotifications" class="badge"></span>
          <span v-if="newNotificationToast" class="notification-toast">
            {{ isArabic ? 'لديك إشعارات جديدة' : 'You have new notifications' }}
          </span>
        </button>
        <NotificationsPanel
          v-if="showNotifications"
          :is-active="showNotifications"
          @close="showNotifications = false"
          @update:hasUnread="updateNotificationStatus"
        />
      </div>
      <!-- Logout Button -->
      <button class="icon logout" @click="logout">
        <LogOutIcon />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { BellIcon, LogOutIcon } from 'lucide-vue-next'
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import NotificationsPanel from './NotificationsPanel.vue'
import notificationService from '@/services/NotificationService'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const router = useRouter()

const isDarkMode = ref(false)
const isArabic = ref(false)
const username = computed(() => authStore.user?.username || '')

// Notifications
const showNotifications = ref(false)
const hasUnreadNotifications = ref(false)
const newNotificationToast = ref(false)
let notificationPolling: number | null = null
let toastTimeout: number | null = null

onMounted(() => {
  isDarkMode.value = themeStore.darkMode
  isArabic.value = themeStore.language === 'ar'

  // Initialize notification status
  checkNotificationStatus()

  // Set up polling for notifications when not viewing the panel
  notificationPolling = window.setInterval(() => {
    if (!showNotifications.value) {
      checkNotificationStatus()
    }
  }, 30000) // Check every 30 seconds
})

onUnmounted(() => {
  if (notificationPolling) {
    clearInterval(notificationPolling)
  }
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
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

// Check for new notifications
async function checkNotificationStatus() {
  if (!authStore.isAuthenticated) return

  try {
    const response = await notificationService.checkSystemNotifications()
    const newStatus = response.Number_Of_Notifications > 0

    // If we're getting new notifications and didn't have any before, show the toast
    if (newStatus && !hasUnreadNotifications.value) {
      showNewNotificationToast()
    }

    hasUnreadNotifications.value = newStatus
  } catch (error) {
    console.error('Error checking notification status:', error)
  }
}

// Show the notification toast for 5 seconds
function showNewNotificationToast() {
  newNotificationToast.value = true

  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }

  toastTimeout = window.setTimeout(() => {
    newNotificationToast.value = false
  }, 5000)
}

// Update notification status from child component
function updateNotificationStatus(status: boolean) {
  hasUnreadNotifications.value = status
}

// Toggle notifications panel
function toggleNotifications() {
  showNotifications.value = !showNotifications.value

  // If opening the panel, hide toast
  if (showNotifications.value) {
    newNotificationToast.value = false
  }
}
</script>

<style scoped>
.header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: linear-gradient(135deg, rgba(80, 19, 39, 0.85), rgba(99, 12, 41, 0.85));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header.dark-theme {
  background: rgba(40, 10, 20, 0.85);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 0 30px rgba(180, 70, 100, 0.03);
}

/* <-- clean left block --> */
.left {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

/* Logo with light effect */
.logo-img {
  width: 36px;
  height: auto;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
  transition: all 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
}

.logo-text {
  font-weight: 700;
  font-size: 22px;
  background: linear-gradient(90deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
  position: relative;
}

/* --- right block --- */
.actions {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 100%;
  position: relative;
}

.icon {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.icon::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.4s ease;
}

.icon:hover::before {
  transform: scale(1);
}

.icon:hover {
  transform: translateY(-2px);
  color: rgba(255, 255, 255, 0.95);
}

.icon:active {
  transform: scale(0.95);
}

.notification-container {
  position: relative;
  z-index: 200;
}

.bell {
  position: relative;
}

.badge {
  position: absolute;
  right: 2px;
  top: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff9800, #ff5252);
  box-shadow: 0 0 10px rgba(255, 152, 0, 0.6);
  animation: pulse 2s infinite;
  z-index: 1;
}

.notification-toast {
  position: absolute;
  top: 40px;
  right: -20px;
  background: #e53e3e;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
  white-space: nowrap;
  pointer-events: none;
  z-index: 300;
  animation: toast-slide-in 0.3s ease-out forwards;
}

.notification-toast::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 26px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #e53e3e;
}

[dir='rtl'] .notification-toast {
  right: auto;
  left: -20px;
}

[dir='rtl'] .notification-toast::before {
  right: auto;
  left: 26px;
}

.logout {
  color: #ffcccb;
  box-shadow: 0 0 0 1px rgba(255, 204, 203, 0.2);
}

.logout:hover {
  box-shadow:
    0 0 0 1px rgba(255, 204, 203, 0.4),
    0 0 15px rgba(255, 204, 203, 0.2);
}

/* Toggle switches */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.03em;
}

.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
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
  background-color: rgba(150, 150, 150, 0.2);
  transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 24px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.slider::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 152, 0, 0.1));
  transform: translateX(-100%);
  transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

input:checked + .slider {
  background-color: rgba(255, 152, 0, 0.3);
}

input:checked + .slider::after {
  transform: translateX(0);
}

input:focus + .slider {
  box-shadow:
    0 0 2px rgba(255, 152, 0, 0.6),
    0 0 0 1px rgba(255, 152, 0, 0.3);
}

input:checked + .slider:before {
  transform: translateX(22px);
  background: #ff9800;
  box-shadow: 0 0 8px rgba(255, 152, 0, 0.4);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 152, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
}

@keyframes toast-slide-in {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.username {
  font-size: 0.9rem;
  font-weight: 500;
  padding-right: 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  margin-right: 16px;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.username::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
  display: inline-block;
}

[dir='rtl'] .username {
  padding-right: 0;
  padding-left: 16px;
  border-right: none;
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  margin-right: 0;
  margin-left: 16px;
}
</style>
