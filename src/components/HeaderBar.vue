<!-- HeaderBar.vue -->
<template>
  <header class="header" :class="{ 'dark-theme': isDarkMode }">
    <!-- logo + title -->
    <div class="left">
      <img
        src="@/assets/img/lightidea_logo.png"
        alt="LightIdea Logo"
        class="logo-img"
        style="width: 70px; height: 55px"
      />
      <!-- <img
        src="@/assets/img/lightidea_logo.png"
        alt="LightIdea Logo"
        class="logo-img"
        style="width: 115px; height: auto"
      /> -->
      <!-- <h1 class="logo-text" style="transform: translateY(12px) !important">
        {{ isArabic ? 'مناقلة' : 'Budget Transfer' }}
      </h1> -->
    </div>

    <!-- action icons -->
    <div class="actions">
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
        <button ref="notificationButtonRef" class="icon bell" @click="toggleNotifications">
          <BellIcon />
          <span v-if="hasUnreadNotifications" class="badge"></span>
          <span v-if="newNotificationToast" class="notification-toast">
            {{ isArabic ? 'لديك إشعارات جديدة' : 'You have new notifications' }}
          </span>
        </button>
      </div>
      <!-- Logout Button -->
      <button class="icon logout" @click="logout">
        <LogOutIcon />
      </button>
    </div>
  </header>

  <!-- Portal the notifications panel to body to avoid z-index issues -->
  <Teleport to="body">
    <NotificationsPanel
      v-if="showNotifications"
      :is-active="showNotifications"
      :notification-button-ref="notificationButtonRef"
      @close="showNotifications = false"
      @update:hasUnread="updateNotificationStatus"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { BellIcon, LogOutIcon } from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'
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
const notificationButtonRef = ref<HTMLElement | null>(null)

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
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 44px;
  background: linear-gradient(135deg, #fff6fa 0%, #f8f6f8 25%, #e4c9d6 60%, #8a2a44 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #1a1423;
  box-shadow:
    0 8px 32px rgba(138, 42, 68, 0.15),
    0 4px 16px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 2px 8px rgba(138, 42, 68, 0.05);
  position: sticky;
  top: 0;
  z-index: 150;
  border-bottom: 1px solid rgba(228, 201, 214, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.08), transparent);
  animation: header-shimmer 4s infinite;
  z-index: 1;
}

.header.dark-theme {
  background: linear-gradient(135deg, #241726 0%, #18131a 25%, #51203c 60%, #6d1a36 100%);
  color: #f8e9f0;
  box-shadow:
    0 8px 32px rgba(167, 56, 92, 0.25),
    0 4px 16px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.15),
    0 2px 8px rgba(167, 56, 92, 0.1);
  border-bottom: 1px solid rgba(81, 32, 60, 0.4);
}

.header.dark-theme::before {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.15), transparent);
}

/* <-- clean left block --> */
.left {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  padding: 12px 20px;
  border-radius: 16px;
  background: rgba(255, 246, 250, 0.3);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(228, 201, 214, 0.2);
  box-shadow:
    0 4px 16px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  z-index: 2;
}

.header.dark-theme .left {
  background: rgba(36, 23, 38, 0.4);
  border: 1px solid rgba(81, 32, 60, 0.3);
  box-shadow:
    0 4px 16px rgba(167, 56, 92, 0.12),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.left:hover {
  background: rgba(255, 246, 250, 0.5);
  border-color: rgba(225, 75, 106, 0.3);
  box-shadow:
    0 6px 20px rgba(138, 42, 68, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.header.dark-theme .left:hover {
  background: rgba(36, 23, 38, 0.6);
  border-color: rgba(225, 75, 106, 0.4);
  box-shadow:
    0 6px 20px rgba(167, 56, 92, 0.18),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

/* Logo with light effect */
.logo-img {
  width: 36px;
  height: auto;
  filter: drop-shadow(0 0 8px rgba(138, 42, 68, 0.2));
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
}

.logo-img:hover {
  transform: scale(1.08) rotate(2deg);
  filter: drop-shadow(0 0 12px rgba(225, 75, 106, 0.4));
}

.header.dark-theme .logo-img {
  filter: drop-shadow(0 0 8px rgba(167, 56, 92, 0.3));
}

.header.dark-theme .logo-img:hover {
  filter: drop-shadow(0 0 12px rgba(225, 75, 106, 0.6));
}

.logo-text {
  font-weight: 700;
  font-size: 22px;
  background: linear-gradient(135deg, #6d1a36, #8a2a44, #e14b6a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
  position: relative;
  text-shadow: 0 0 20px rgba(138, 42, 68, 0.3);
}

/* --- right block --- */
.actions {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
  position: relative;
  z-index: 2;
}

.icon {
  background: rgba(255, 246, 250, 0.4);
  border: 1px solid rgba(228, 201, 214, 0.3);
  color: #1a1423;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
    0 2px 8px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.header.dark-theme .icon {
  background: rgba(36, 23, 38, 0.6);
  border: 1px solid rgba(81, 32, 60, 0.4);
  color: #f8e9f0;
  box-shadow:
    0 2px 8px rgba(167, 56, 92, 0.12),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.icon::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.1), transparent);
  border-radius: 12px;
  transform: scale(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.header.dark-theme .icon::before {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), transparent);
}

.icon:hover::before {
  transform: scale(1);
}

.icon:hover {
  transform: translateY(-3px);
  color: #6d1a36;
  border-color: #e14b6a;
  box-shadow:
    0 6px 20px rgba(138, 42, 68, 0.2),
    0 2px 8px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.header.dark-theme .icon:hover {
  color: #f8e9f0;
  border-color: #e14b6a;
  box-shadow:
    0 6px 20px rgba(167, 56, 92, 0.3),
    0 2px 8px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

.icon:active {
  transform: translateY(-1px) scale(0.95);
}

.notification-container {
  position: relative;
}

.bell {
  position: relative;
}

.badge {
  position: absolute;
  right: 2px;
  top: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  box-shadow:
    0 0 12px rgba(225, 75, 106, 0.6),
    0 0 6px rgba(138, 42, 68, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: pulse-notification 2s infinite;
  z-index: 1;
  border: 2px solid rgba(255, 246, 250, 0.8);
}

.header.dark-theme .badge {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  box-shadow:
    0 0 12px rgba(225, 75, 106, 0.8),
    0 0 6px rgba(167, 56, 92, 0.6),
    inset 0 1px 0 rgba(248, 233, 240, 0.2);
  border: 2px solid rgba(36, 23, 38, 0.8);
}

.notification-toast {
  position: absolute;
  top: 50px;
  right: -30px;
  background: linear-gradient(135deg, #6d1a36, #8a2a44);
  color: #f8e9f0;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 12px;
  box-shadow:
    0 8px 24px rgba(138, 42, 68, 0.3),
    0 4px 12px rgba(138, 42, 68, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  white-space: nowrap;
  pointer-events: none;
  z-index: 400;
  animation: toast-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(225, 75, 106, 0.3);
}

.header.dark-theme .notification-toast {
  background: linear-gradient(135deg, #a7385c, #6d1a36);
  box-shadow:
    0 8px 24px rgba(167, 56, 92, 0.4),
    0 4px 12px rgba(167, 56, 92, 0.3),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
  border: 1px solid rgba(225, 75, 106, 0.4);
}

.notification-toast::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 36px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #6d1a36;
  filter: drop-shadow(0 -2px 4px rgba(138, 42, 68, 0.2));
}

.header.dark-theme .notification-toast::before {
  border-bottom: 8px solid #a7385c;
  filter: drop-shadow(0 -2px 4px rgba(167, 56, 92, 0.3));
}

[dir='rtl'] .notification-toast {
  right: auto;
  left: -30px;
}

[dir='rtl'] .notification-toast::before {
  right: auto;
  left: 36px;
}

.logout {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.1), rgba(138, 42, 68, 0.05));
  color: #6d1a36;
  border: 1px solid rgba(225, 75, 106, 0.3);
  box-shadow:
    0 2px 8px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.logout::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.1), transparent);
  transition: left 0.5s ease-in-out;
}

.logout:hover {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(138, 42, 68, 0.1));
  border-color: #e14b6a;
  box-shadow:
    0 6px 20px rgba(138, 42, 68, 0.2),
    0 2px 8px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

.logout:hover::after {
  left: 0;
}

.header.dark-theme .logout {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.15), rgba(167, 56, 92, 0.1));
  color: #f8e9f0;
  border: 1px solid rgba(225, 75, 106, 0.4);
  box-shadow:
    0 2px 8px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.header.dark-theme .logout::after {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.2), transparent);
}

.header.dark-theme .logout:hover {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.25), rgba(167, 56, 92, 0.15));
  border-color: #e14b6a;
  box-shadow:
    0 6px 20px rgba(167, 56, 92, 0.3),
    0 2px 8px rgba(167, 56, 92, 0.2),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

/* Toggle switches */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255, 246, 250, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(228, 201, 214, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 2px 8px rgba(138, 42, 68, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.header.dark-theme .toggle-container {
  background: rgba(36, 23, 38, 0.4);
  border: 1px solid rgba(81, 32, 60, 0.3);
  box-shadow:
    0 2px 8px rgba(167, 56, 92, 0.08),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.toggle-container:hover {
  background: rgba(255, 246, 250, 0.5);
  border-color: rgba(225, 75, 106, 0.3);
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.header.dark-theme .toggle-container:hover {
  background: rgba(36, 23, 38, 0.6);
  border-color: rgba(225, 75, 106, 0.4);
  box-shadow:
    0 4px 12px rgba(167, 56, 92, 0.12),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

.toggle-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: #6d1a36;
  transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 1px 2px rgba(138, 42, 68, 0.1);
}

.header.dark-theme .toggle-label {
  color: #c8a9b4;
  text-shadow: 0 1px 2px rgba(167, 56, 92, 0.2);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
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
  background: rgba(228, 201, 214, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 26px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(228, 201, 214, 0.2);
  overflow: hidden;
  box-shadow:
    inset 0 2px 4px rgba(138, 42, 68, 0.1),
    0 1px 3px rgba(138, 42, 68, 0.05);
}

.header.dark-theme .slider {
  background: rgba(81, 32, 60, 0.4);
  border: 1px solid rgba(81, 32, 60, 0.3);
  box-shadow:
    inset 0 2px 4px rgba(167, 56, 92, 0.15),
    0 1px 3px rgba(167, 56, 92, 0.08);
}

.slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 2px;
  background: linear-gradient(135deg, #fff6fa, #f8f6f8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow:
    0 3px 8px rgba(138, 42, 68, 0.2),
    0 1px 3px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  z-index: 2;
  border: 1px solid rgba(228, 201, 214, 0.2);
}

.header.dark-theme .slider:before {
  background: linear-gradient(135deg, #51203c, #241726);
  box-shadow:
    0 3px 8px rgba(167, 56, 92, 0.3),
    0 1px 3px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.2);
  border: 1px solid rgba(81, 32, 60, 0.3);
}

.slider::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.1));
  transform: translateX(-100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.header.dark-theme .slider::after {
  background: linear-gradient(90deg, transparent, rgba(225, 75, 106, 0.2));
}

input:checked + .slider {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  border-color: #e14b6a;
  box-shadow:
    inset 0 2px 4px rgba(109, 26, 54, 0.3),
    0 0 12px rgba(225, 75, 106, 0.3);
}

.header.dark-theme input:checked + .slider {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  box-shadow:
    inset 0 2px 4px rgba(109, 26, 54, 0.4),
    0 0 12px rgba(225, 75, 106, 0.4);
}

input:checked + .slider::after {
  transform: translateX(0);
}

input:focus + .slider {
  box-shadow:
    0 0 4px rgba(225, 75, 106, 0.5),
    0 0 0 2px rgba(225, 75, 106, 0.2),
    inset 0 2px 4px rgba(138, 42, 68, 0.1);
}

input:checked + .slider:before {
  transform: translateX(24px);
  background: linear-gradient(135deg, #fff6fa, #f8f6f8);
  box-shadow:
    0 4px 12px rgba(225, 75, 106, 0.4),
    0 2px 6px rgba(225, 75, 106, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(225, 75, 106, 0.3);
}

.header.dark-theme input:checked + .slider:before {
  background: linear-gradient(135deg, #f8e9f0, #c8a9b4);
  box-shadow:
    0 4px 12px rgba(225, 75, 106, 0.5),
    0 2px 6px rgba(225, 75, 106, 0.3),
    inset 0 1px 0 rgba(248, 233, 240, 0.4);
  border: 1px solid rgba(225, 75, 106, 0.4);
}

@keyframes pulse-notification {
  0% {
    box-shadow:
      0 0 12px rgba(225, 75, 106, 0.6),
      0 0 6px rgba(138, 42, 68, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow:
      0 0 20px rgba(225, 75, 106, 0.8),
      0 0 10px rgba(138, 42, 68, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    transform: scale(1.1);
  }
  100% {
    box-shadow:
      0 0 12px rgba(225, 75, 106, 0.6),
      0 0 6px rgba(138, 42, 68, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

@keyframes header-shimmer {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes toast-slide-in {
  0% {
    opacity: 0;
    transform: translateY(-15px) scale(0.9);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.username {
  font-size: 0.9rem;
  font-weight: 600;
  padding-right: 18px;
  border-right: 1px solid rgba(228, 201, 214, 0.3);
  margin-right: 18px;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  color: #6d1a36;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 18px 8px 0;
  background: rgba(255, 246, 250, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.header.dark-theme .username {
  color: #c8a9b4;
  border-right: 1px solid rgba(81, 32, 60, 0.4);
  background: rgba(36, 23, 38, 0.3);
}

.username::before {
  content: '';
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  border-radius: 50%;
  box-shadow:
    0 0 12px rgba(225, 75, 106, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  display: inline-block;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: pulse-glow-username 3s ease-in-out infinite;
}

.header.dark-theme .username::before {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  box-shadow:
    0 0 12px rgba(225, 75, 106, 0.6),
    inset 0 1px 0 rgba(248, 233, 240, 0.2);
}

.username:hover {
  color: #8a2a44;
  background: rgba(255, 246, 250, 0.4);
  transform: translateY(-1px);
}

.header.dark-theme .username:hover {
  color: #f8e9f0;
  background: rgba(36, 23, 38, 0.5);
}

[dir='rtl'] .username {
  padding-right: 0;
  padding-left: 18px;
  border-right: none;
  border-left: 1px solid rgba(228, 201, 214, 0.3);
  margin-right: 0;
  margin-left: 18px;
}

[dir='rtl'] .header.dark-theme .username {
  border-left: 1px solid rgba(81, 32, 60, 0.4);
}

@keyframes pulse-glow-username {
  0% {
    box-shadow:
      0 0 12px rgba(225, 75, 106, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow:
      0 0 18px rgba(225, 75, 106, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    transform: scale(1.1);
  }
  100% {
    box-shadow:
      0 0 12px rgba(225, 75, 106, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

/* Enhanced interactivity and smooth transitions */
.header *,
.header *::before,
.header *::after {
  transition-property: color, background-color, border-color, box-shadow, transform, opacity;
  transition-duration: 0.4s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states for accessibility */
.icon:focus-visible,
.toggle-container:focus-within {
  outline: 2px solid rgba(225, 75, 106, 0.5);
  outline-offset: 2px;
  border-radius: 12px;
}
</style>
