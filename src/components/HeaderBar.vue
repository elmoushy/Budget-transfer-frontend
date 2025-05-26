<!-- HeaderBar.vue -->
<template>
  <header class="header" :class="{ 'dark-theme': isDarkMode }">
    <!-- logo + title -->
    <div class="left">
      <img
        src="@/assets/img/Public_Investment Fund_id.png"
        alt="LightIdea Logo"
        class="logo-img"
        style="width: 115px; height: auto"
      />
      <!-- <h1 class="logo-text" style="transform: translateY(12px) !important">
        {{ isArabic ? 'مناقلة' : 'Budget Transfer' }}
      </h1> -->
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
  background: linear-gradient(90deg, #e5f6f5 0%, #a4cac5 35%, #5e9b92 70%, #2c6d62 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #0c362f;
  box-shadow: 0 4px 20px rgba(14, 77, 67, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(44, 109, 98, 0.12);
  transition: all 0.3s ease-in-out;
}

.header.dark-theme {
  background: linear-gradient(90deg, #a4cac5 0%, #5e9b92 25%, #2c6d62 65%, #0e4d43 100%);
  color: #e5f6f5;
  box-shadow: 0 4px 20px rgba(14, 77, 67, 0.15);
  border-bottom: 1px solid rgba(229, 246, 245, 0.15);
}

/* <-- clean left block --> */
.left {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(229, 246, 245, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.3s ease-in-out;
}

.header.dark-theme .left {
  background: rgba(229, 246, 245, 0.15);
}

/* Logo with light effect */
.logo-img {
  width: 36px;
  height: auto;
  filter: drop-shadow(0 0 4px rgba(14, 77, 67, 0.1));
  transition: all 0.3s ease-in-out;
}

.logo-img:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 8px rgba(14, 77, 67, 0.2));
}

.logo-text {
  font-weight: 700;
  font-size: 22px;
  background: linear-gradient(90deg, #0c362f, #2c6d62);
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
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;
}

.icon::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(14, 77, 67, 0.08);
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.3s ease-in-out;
}

.header.dark-theme .icon::before {
  background: rgba(229, 246, 245, 0.1);
}

.icon:hover::before {
  transform: scale(1);
}

.icon:hover {
  transform: translateY(-2px);
  color: #0e4d43;
}

.header.dark-theme .icon:hover {
  color: #e5f6f5;
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
  background: linear-gradient(45deg, #0e4d43, #2c6d62);
  box-shadow: 0 0 10px rgba(14, 77, 67, 0.4);
  animation: pulse 2s infinite;
  z-index: 1;
}

.notification-toast {
  position: absolute;
  top: 40px;
  right: -20px;
  background: #0e4d43;
  color: #e5f6f5;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(14, 77, 67, 0.25);
  white-space: nowrap;
  pointer-events: none;
  z-index: 300;
  animation: toast-slide-in 0.3s ease-out forwards;
  transition: all 0.3s ease-in-out;
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
  border-bottom: 6px solid #0e4d43;
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
  border-bottom: 6px solid #0e4d43;
}

[dir='rtl'] .notification-toast {
  right: auto;
  left: -20px;
}

[dir='rtl'] .notification-toast::before {
  right: auto;
  left: 26px;
  border-bottom: 6px solid #0e4d43;
}

.logout {
  color: #0e4d43;
  box-shadow: 0 0 0 1px rgba(14, 77, 67, 0.2);
  transition: all 0.3s ease-in-out;
}

.logout:hover {
  box-shadow:
    0 0 0 1px rgba(14, 77, 67, 0.4),
    0 0 15px rgba(14, 77, 67, 0.15);
}

.header.dark-theme .logout {
  color: #e5f6f5;
  box-shadow: 0 0 0 1px rgba(229, 246, 245, 0.2);
}

.header.dark-theme .logout:hover {
  box-shadow:
    0 0 0 1px rgba(229, 246, 245, 0.4),
    0 0 15px rgba(229, 246, 245, 0.15);
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
  color: #0c362f;
  transition: color 0.3s ease-in-out;
}

.header.dark-theme .toggle-label {
  color: #e5f6f5;
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
  background-color: rgba(94, 155, 146, 0.2);
  transition: 0.3s ease-in-out;
  border-radius: 24px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(44, 109, 98, 0.15);
  overflow: hidden;
}

.header.dark-theme .slider {
  background-color: rgba(164, 202, 197, 0.2);
  border: 1px solid rgba(229, 246, 245, 0.15);
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 2px;
  background-color: #e5f6f5;
  transition: 0.3s ease-in-out;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(14, 77, 67, 0.15);
  z-index: 2;
}

.header.dark-theme .slider:before {
  background-color: #2c6d62;
}

.slider::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(14, 77, 67, 0.1));
  transform: translateX(-100%);
  transition: 0.3s ease-in-out;
}

input:checked + .slider {
  background-color: rgba(14, 77, 67, 0.3);
}

.header.dark-theme input:checked + .slider {
  background-color: rgba(164, 202, 197, 0.3);
}

input:checked + .slider::after {
  transform: translateX(0);
}

input:focus + .slider {
  box-shadow:
    0 0 2px rgba(14, 77, 67, 0.4),
    0 0 0 1px rgba(14, 77, 67, 0.2);
}

input:checked + .slider:before {
  transform: translateX(22px);
  background: #0e4d43;
  box-shadow: 0 0 8px rgba(14, 77, 67, 0.3);
}

.header.dark-theme input:checked + .slider:before {
  background: #a4cac5;
  box-shadow: 0 0 8px rgba(164, 202, 197, 0.3);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(14, 77, 67, 0.5);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(14, 77, 67, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(14, 77, 67, 0);
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
  border-right: 1px solid rgba(44, 109, 98, 0.2);
  margin-right: 16px;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  color: #0c362f;
  transition: color 0.3s ease-in-out;
}

.header.dark-theme .username {
  color: #e5f6f5;
  border-right: 1px solid rgba(164, 202, 197, 0.2);
}

.username::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #0e4d43;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(14, 77, 67, 0.4);
  display: inline-block;
  transition: all 0.3s ease-in-out;
}

.header.dark-theme .username::before {
  background: #a4cac5;
  box-shadow: 0 0 8px rgba(164, 202, 197, 0.4);
}

[dir='rtl'] .username {
  padding-right: 0;
  padding-left: 16px;
  border-right: none;
  border-left: 1px solid rgba(44, 109, 98, 0.2);
  margin-right: 0;
  margin-left: 16px;
}

[dir='rtl'] .header.dark-theme .username {
  border-left: 1px solid rgba(164, 202, 197, 0.2);
}
</style>
