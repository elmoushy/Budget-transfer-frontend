<!-- NotificationsPanel.vue -->
<template>
  <div
    class="notifications-panel"
    :class="{
      active: isActive,
      'dark-theme': isDarkMode,
      rtl: isArabic,
    }"
  >
    <div class="panel-header">
      <h3>{{ isArabic ? 'الإشعارات' : 'Notifications' }}</h3>
      <div class="actions">
        <button class="action-btn view-all" @click="viewAllNotifications">
          {{ isArabic ? 'عرض الكل' : 'View all' }}
        </button>
        <button class="action-btn mark-all" @click="markAllAsRead">
          {{ isArabic ? 'تعليم كمقروءة' : 'Mark all as read' }}
        </button>
        <button class="close-btn" @click="closePanel">
          <X :size="18" />
        </button>
      </div>
    </div>

    <div class="panel-content" :class="{ loading: isLoading }">
      <div v-if="isLoading" class="loading-state">
        <div class="loader"></div>
        <p>{{ isArabic ? 'جاري التحميل...' : 'Loading...' }}</p>
      </div>

      <div v-else-if="notifications.length === 0" class="empty-state">
        <Bell :size="32" />
        <p>{{ isArabic ? 'ليس لديك إشعارات جديدة' : 'You have no new notifications' }}</p>
      </div>

      <template v-else>
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.is_read }"
          @click="readNotification(notification)"
        >
          <div class="notification-icon" :class="getNotificationType(notification)">
            <component :is="getIconForType(getNotificationType(notification))" :size="18" />
          </div>
          <div class="notification-content">
            <h4>{{ getNotificationTitle(notification) }}</h4>
            <p>{{ notification.message }}</p>
            <span class="timestamp">{{ formatTime(new Date(notification.created_at)) }}</span>
          </div>
          <div class="notification-actions">
            <button class="action-btn" @click.stop="removeNotification(notification)">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useRouter } from 'vue-router'
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign,
  X,
  Trash2,
  User,
} from 'lucide-vue-next'
import notificationService from '@/services/NotificationService'
import type { Notification } from '@/services/NotificationService'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'update:hasUnread'])

const router = useRouter()
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')

// Notifications data
const notifications = ref<Notification[]>([])
const isLoading = ref(false)
const hasNewNotifications = ref(false)
let pollingInterval: number | null = null

// Fetch notifications on mount
onMounted(() => {
  fetchUnreadNotifications()
  startPolling()
})

// Clean up on unmount
onUnmounted(() => {
  stopPolling()
})

// Start polling for new notifications
function startPolling() {
  pollingInterval = window.setInterval(() => {
    checkForNewNotifications()
  }, 30000) // Poll every 30 seconds
}

// Stop polling
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

// Check for new notifications
async function checkForNewNotifications() {
  try {
    const response = await notificationService.checkSystemNotifications()
    hasNewNotifications.value = response.Number_Of_Notifications > 0

    // Emit event to update the parent component
    emit('update:hasUnread', hasNewNotifications.value)

    // If panel is active, refresh the notifications list
    if (props.isActive) {
      fetchUnreadNotifications()
    }
  } catch (error) {
    console.error('Error checking for new notifications:', error)
  }
}

// Fetch unread notifications
async function fetchUnreadNotifications() {
  isLoading.value = true
  try {
    const response = await notificationService.getUnreadNotifications()
    notifications.value = response.notifications || []

    // Update the notification status
    hasNewNotifications.value = notifications.value.length > 0
    emit('update:hasUnread', hasNewNotifications.value)
  } catch (error) {
    console.error('Error fetching unread notifications:', error)
  } finally {
    isLoading.value = false
  }
}

// Get notification type based on content
function getNotificationType(notification: Notification): string {
  const message = notification.message.toLowerCase()
  if (message.includes('budget') || message.includes('ميزانية')) {
    return 'success'
  } else if (message.includes('transfer') || message.includes('تحويل')) {
    return 'warning'
  } else if (message.includes('system') || message.includes('نظام')) {
    return 'info'
  } else if (message.includes('error') || message.includes('خطأ')) {
    return 'danger'
  } else if (message.includes('user') || message.includes('مستخدم')) {
    return 'user'
  }
  return 'info'
}

// Get notification title based on content
function getNotificationTitle(notification: Notification): string {
  const message = notification.message.toLowerCase()

  if (isArabic.value) {
    if (message.includes('budget') || message.includes('ميزانية')) {
      return 'تحديث الميزانية'
    } else if (message.includes('transfer') || message.includes('تحويل')) {
      return 'طلب تحويل'
    } else if (message.includes('system') || message.includes('نظام')) {
      return 'تحديث النظام'
    } else if (message.includes('error') || message.includes('خطأ')) {
      return 'تنبيه'
    } else if (message.includes('user') || message.includes('مستخدم')) {
      return 'مستخدم جديد'
    }
    return 'إشعار'
  } else {
    if (message.includes('budget') || message.includes('ميزانية')) {
      return 'Budget Update'
    } else if (message.includes('transfer') || message.includes('تحويل')) {
      return 'Transfer Request'
    } else if (message.includes('system') || message.includes('نظام')) {
      return 'System Update'
    } else if (message.includes('error') || message.includes('خطأ')) {
      return 'Alert'
    } else if (message.includes('user') || message.includes('مستخدم')) {
      return 'New User'
    }
    return 'Notification'
  }
}

// Get appropriate icon based on notification type
function getIconForType(type: string) {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertTriangle
    case 'info':
      return FileText
    case 'danger':
      return DollarSign
    case 'user':
      return User
    default:
      return Bell
  }
}

// Format timestamp
function formatTime(timestamp: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (isArabic.value) {
    if (diffMinutes < 60) {
      return `منذ ${diffMinutes} دقيقة`
    } else if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`
    } else {
      return `منذ ${diffDays} يوم`
    }
  } else {
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    } else {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    }
  }
}

// Mark notification as read
async function readNotification(notification: Notification) {
  if (!notification.is_read) {
    try {
      await notificationService.markNotificationAsRead(notification.id)
      notification.is_read = true

      // Update notification status
      checkForNewNotifications()
    } catch (error) {
      console.error(`Error marking notification ${notification.id} as read:`, error)
    }
  }
}

// Mark all notifications as read
async function markAllAsRead() {
  try {
    await notificationService.markAllNotificationsAsRead()

    // Refresh notifications list instead of just updating local state
    await fetchUnreadNotifications()

    // Update notification status
    hasNewNotifications.value = false
    emit('update:hasUnread', false)
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

// Remove a notification
async function removeNotification(notification: Notification) {
  try {
    await notificationService.deleteNotification(notification.id)
    notifications.value = notifications.value.filter((n) => n.id !== notification.id)

    // Update notification status
    hasNewNotifications.value = notifications.value.some((n) => !n.is_read)
    emit('update:hasUnread', hasNewNotifications.value)
  } catch (error) {
    console.error(`Error deleting notification ${notification.id}:`, error)
  }
}

// Navigate to all notifications page
function viewAllNotifications() {
  router.push({ name: 'NotificationsPage' })
  closePanel()
}

// Close the panel
function closePanel() {
  emit('close')
}
</script>

<style scoped>
.notifications-panel {
  position: absolute;
  top: 64px;
  right: 0;
  width: 380px;
  max-height: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 0 40px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: top right;
  animation: panel-appear 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.rtl.notifications-panel {
  right: auto;
  left: 20px;
  transform-origin: top left;
}

.dark-theme.notifications-panel {
  background: rgba(30, 30, 35, 0.95);
  box-shadow:
    0 10px 35px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 50px rgba(0, 0, 0, 0.15);
}

.panel-header {
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dark-theme .panel-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.panel-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.dark-theme .panel-header h3 {
  color: #f0f0f0;
}

.panel-header .actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  background: transparent;
  border: none;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.dark-theme .action-btn {
  color: #aaa;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.dark-theme .action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
}

.action-btn.mark-all,
.action-btn.view-all {
  font-weight: 500;
}

.close-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.dark-theme .close-btn {
  color: #aaa;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.dark-theme .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
}

.panel-content {
  overflow-y: auto;
  flex: 1;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.panel-content.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.panel-content::-webkit-scrollbar {
  width: 5px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.dark-theme .panel-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.notification-item {
  padding: 15px 20px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.dark-theme .notification-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.dark-theme .notification-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.notification-item.unread {
  background: rgba(138, 42, 68, 0.04);
}

.dark-theme .notification-item.unread {
  background: rgba(138, 42, 68, 0.1);
}

.notification-item.unread:hover {
  background: rgba(138, 42, 68, 0.06);
}

.dark-theme .notification-item.unread:hover {
  background: rgba(138, 42, 68, 0.15);
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.success {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.notification-icon.warning {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.notification-icon.info {
  background: rgba(66, 153, 225, 0.1);
  color: #4299e1;
}

.notification-icon.danger {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.notification-icon.user {
  background: rgba(128, 90, 213, 0.1);
  color: #805ad5;
}

.dark-theme .notification-icon.success {
  background: rgba(72, 187, 120, 0.15);
}

.dark-theme .notification-icon.warning {
  background: rgba(237, 137, 54, 0.15);
}

.dark-theme .notification-icon.info {
  background: rgba(66, 153, 225, 0.15);
}

.dark-theme .notification-icon.danger {
  background: rgba(229, 62, 62, 0.15);
}

.dark-theme .notification-icon.user {
  background: rgba(128, 90, 213, 0.15);
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 5px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.dark-theme .notification-content h4 {
  color: #f0f0f0;
}

.notification-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.dark-theme .notification-content p {
  color: #bbb;
}

.timestamp {
  display: block;
  font-size: 0.75rem;
  color: #999;
  margin-top: 6px;
}

.dark-theme .timestamp {
  color: #777;
}

.notification-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.empty-state,
.loading-state {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.dark-theme .empty-state,
.dark-theme .loading-state {
  color: #777;
}

.empty-state p,
.loading-state p {
  margin-top: 15px;
  text-align: center;
}

/* Loading spinner */
.loader {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(138, 42, 68, 0.2);
  border-radius: 50%;
  border-top-color: rgba(138, 42, 68, 0.8);
  animation: spin 1s ease-in-out infinite;
}

.dark-theme .loader {
  border: 3px solid rgba(138, 42, 68, 0.3);
  border-top-color: rgba(138, 42, 68, 0.8);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes panel-appear {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* RTL support */
.rtl .notification-item {
  text-align: right;
}

/* New notification alert */
.new-notification-alert {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(229, 62, 62, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
  }
}
</style>
