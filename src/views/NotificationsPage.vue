<!-- NotificationsPage.vue -->
<template>
  <div class="notifications-page" :class="{ 'dark-theme': isDarkMode }">
    <div class="page-header">
      <h1>{{ isArabic ? 'سجل الإشعارات' : 'Notifications History' }}</h1>
      <div class="header-actions">
        <button class="action-button" @click="markAllAsRead">
          <CheckCircle :size="18" class="icon" />
          {{ isArabic ? 'تعليم الكل كمقروءة' : 'Mark all as read' }}
        </button>
        <button class="action-button" @click="refreshNotifications">
          <RefreshCwIcon :size="18" class="icon" />
          {{ isArabic ? 'تحديث' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div class="notifications-container">
      <div v-if="isLoading" class="loading-state">
        <div class="loader"></div>
        <p>{{ isArabic ? 'جاري تحميل الإشعارات...' : 'Loading notifications...' }}</p>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <InboxIcon :size="48" />
        <p>{{ isArabic ? 'لا توجد إشعارات لعرضها' : 'No notifications to display' }}</p>
      </div>

      <template v-else>
        <div
          class="notification-item-container"
          v-for="notification in filteredNotifications"
          :key="notification.id"
        >
          <div class="notification-date">{{ formatDate(notification.created_at) }}</div>

          <div class="notification-item" :class="{ 'is-read': notification.is_read }">
            <div class="notification-icon" :class="getNotificationType(notification)">
              <component :is="getIconForType(getNotificationType(notification))" :size="20" />
            </div>

            <div class="notification-content">
              <h3>{{ getNotificationTitle(notification) }}</h3>
              <p>{{ notification.message }}</p>
              <div class="notification-meta">
                <span class="timestamp">{{ formatTime(new Date(notification.created_at)) }}</span>
                <span class="status" :class="{ unread: !notification.is_read }">
                  {{
                    notification.is_read
                      ? isArabic
                        ? 'مقروءة'
                        : 'Read'
                      : isArabic
                        ? 'غير مقروءة'
                        : 'Unread'
                  }}
                </span>
              </div>
            </div>

            <div class="notification-actions">
              <button
                v-if="!notification.is_read"
                class="action-icon"
                @click="markAsRead(notification)"
                :title="isArabic ? 'تعليم كمقروءة' : 'Mark as read'"
              >
                <CheckCircle :size="18" />
              </button>
              <button
                class="action-icon"
                @click="removeNotification(notification)"
                :title="isArabic ? 'حذف' : 'Delete'"
              >
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign,
  Trash2,
  User,
  RefreshCw as RefreshCwIcon,
  Inbox as InboxIcon,
} from 'lucide-vue-next'
import notificationService, { type Notification } from '@/services/NotificationService'

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')

// State
const notifications = ref<Notification[]>([])
const isLoading = ref(false)
const statusFilter = ref('all')
const searchQuery = ref('')

// Computed
const filteredNotifications = computed(() => {
  return notifications.value
    .filter((notification) => {
      // Apply status filter
      if (statusFilter.value === 'read') return notification.is_read
      if (statusFilter.value === 'unread') return !notification.is_read
      return true
    })
    .filter((notification) => {
      // Apply search filter
      if (!searchQuery.value) return true
      return notification.message.toLowerCase().includes(searchQuery.value.toLowerCase())
    })
})

// Lifecycle hooks
onMounted(() => {
  fetchAllNotifications()
})

// Methods
async function fetchAllNotifications() {
  isLoading.value = true
  try {
    const response = await notificationService.getAllNotifications()
    notifications.value = response.notifications || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    isLoading.value = false
  }
}

async function markAsRead(notification: Notification) {
  try {
    await notificationService.markNotificationAsRead(notification.id)
    notification.is_read = true
  } catch (error) {
    console.error(`Error marking notification ${notification.id} as read:`, error)
  }
}

async function markAllAsRead() {
  try {
    await notificationService.markAllNotificationsAsRead()

    // Refresh notifications to get the latest data from the server
    await fetchAllNotifications()
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

async function removeNotification(notification: Notification) {
  try {
    await notificationService.deleteNotification(notification.id)
    notifications.value = notifications.value.filter((n) => n.id !== notification.id)
  } catch (error) {
    console.error(`Error deleting notification ${notification.id}:`, error)
  }
}

function refreshNotifications() {
  fetchAllNotifications()
}

// Format date display (only date, not time)
function formatDate(dateString: string): string {
  const date = new Date(dateString)

  if (isArabic.value) {
    // Arabic date format
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } else {
    // English date format
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }
}

// Format timestamp (relative time)
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
</script>

<style scoped>
.notifications-page {
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fffe 0%, #e8f8f5 50%, #d1fae5 100%);
  border-radius: 20px;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.notifications-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.05) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(5, 150, 105, 0.05) 2px, transparent 2px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.notifications-page.dark-theme {
  background: linear-gradient(135deg, #041510 0%, #0a2718 100%);
  color: #e8f8f5;
}

.notifications-page.dark-theme::before {
  background:
    radial-gradient(circle at 25% 25%, rgba(0, 255, 140, 0.08) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.08) 2px, transparent 2px);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #10b981, #059669);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);
}

.dark-theme .page-header h1 {
  background: linear-gradient(135deg, #00ff8c, #10b981);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 0 15px rgba(0, 255, 140, 0.3);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  position: relative;
  overflow: hidden;
}

.action-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(35deg);
  transition: transform 0.5s ease;
  opacity: 0;
}

.action-button:hover::before {
  opacity: 1;
  transform: rotate(35deg) translate(10%, 10%);
}

.dark-theme .action-button {
  background: linear-gradient(135deg, #00ff8c, #10b981);
  box-shadow: 0 0 20px rgba(0, 255, 140, 0.4);
  color: #041510;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.dark-theme .action-button:hover {
  box-shadow: 0 0 25px rgba(0, 255, 140, 0.6);
}

.notification-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.1);
  position: relative;
  z-index: 1;
}

.dark-theme .notification-filters {
  background: rgba(4, 21, 16, 0.8);
  box-shadow: 0 8px 25px rgba(0, 255, 140, 0.15);
  border: 1px solid rgba(0, 255, 140, 0.2);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-size: 0.9rem;
  color: #047857;
  font-weight: 500;
}

.dark-theme .filter-group label {
  color: rgba(0, 255, 140, 0.8);
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  color: #064e3b;
  transition: all 0.3s ease;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.dark-theme .filter-group select,
.dark-theme .filter-group input {
  background: rgba(4, 21, 16, 0.9);
  border: 2px solid rgba(0, 255, 140, 0.3);
  color: #00ff8c;
}

.dark-theme .filter-group select:focus,
.dark-theme .filter-group input:focus {
  border-color: #00ff8c;
  box-shadow: 0 0 0 3px rgba(0, 255, 140, 0.3);
}

.filter-group input {
  width: 220px;
}

.notifications-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.notification-item-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-date {
  font-size: 0.85rem;
  font-weight: 600;
  color: #047857;
  margin-left: 4px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1));
  padding: 6px 12px;
  border-radius: 8px;
  display: inline-block;
  width: fit-content;
}

.dark-theme .notification-date {
  color: rgba(0, 255, 140, 0.9);
  background: linear-gradient(135deg, rgba(0, 255, 140, 0.15), rgba(52, 211, 153, 0.1));
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(16, 185, 129, 0.1);
  position: relative;
  overflow: hidden;
}

.notification-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #10b981, #34d399);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notification-item:hover::before {
  opacity: 1;
}

.dark-theme .notification-item {
  background: rgba(4, 21, 16, 0.8);
  box-shadow: 0 8px 25px rgba(0, 255, 140, 0.15);
  border: 1px solid rgba(0, 255, 140, 0.2);
}

.dark-theme .notification-item::before {
  background: linear-gradient(135deg, #00ff8c, #34d399);
}

.notification-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(16, 185, 129, 0.2);
}

.dark-theme .notification-item:hover {
  box-shadow: 0 12px 30px rgba(0, 255, 140, 0.25);
}

.notification-item.is-read {
  opacity: 0.7;
  filter: grayscale(0.3);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.notification-icon::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, currentColor, transparent);
  opacity: 0.2;
  z-index: -1;
}

.notification-icon.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1));
  color: #10b981;
}

.notification-icon.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.1));
  color: #f59e0b;
}

.notification-icon.info {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 211, 238, 0.1));
  color: #06b6d4;
}

.notification-icon.danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.1));
  color: #ef4444;
}

.notification-icon.user {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(110, 231, 183, 0.1));
  color: #10b981;
}

.dark-theme .notification-icon.success {
  background: linear-gradient(135deg, rgba(0, 255, 140, 0.2), rgba(52, 211, 153, 0.15));
  color: #00ff8c;
}

.dark-theme .notification-icon.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.15));
  color: #fbbf24;
}

.dark-theme .notification-icon.info {
  background: linear-gradient(135deg, rgba(0, 255, 140, 0.15), rgba(34, 211, 238, 0.1));
  color: #22d3ee;
}

.dark-theme .notification-icon.danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(248, 113, 113, 0.15));
  color: #f87171;
}

.dark-theme .notification-icon.user {
  background: linear-gradient(135deg, rgba(0, 255, 140, 0.2), rgba(110, 231, 183, 0.15));
  color: #00ff8c;
}

.notification-content {
  flex: 1;
}

.notification-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 6px;
  color: #064e3b;
}

.dark-theme .notification-content h3 {
  color: #00ff8c;
}

.notification-content p {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #047857;
  line-height: 1.4;
}

.dark-theme .notification-content p {
  color: rgba(0, 255, 140, 0.8);
}

.notification-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #059669;
}

.dark-theme .notification-meta {
  color: rgba(0, 255, 140, 0.7);
}

.status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  font-weight: 500;
  font-size: 0.75rem;
}

.status.unread {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.1));
  color: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
}

.dark-theme .status {
  background: rgba(0, 255, 140, 0.15);
  color: #00ff8c;
}

.dark-theme .status.unread {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(248, 113, 113, 0.15));
  color: #f87171;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

.notification-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-icon {
  background: transparent;
  border: none;
  color: #10b981;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 10px;
}

.action-icon:hover::before {
  opacity: 1;
}

.action-icon:hover {
  color: #059669;
  transform: scale(1.1);
}

.dark-theme .action-icon {
  color: rgba(0, 255, 140, 0.8);
}

.dark-theme .action-icon::before {
  background: linear-gradient(135deg, rgba(0, 255, 140, 0.15), rgba(52, 211, 153, 0.1));
}

.dark-theme .action-icon:hover {
  color: #00ff8c;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #047857;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 16px;
  border: 2px dashed rgba(16, 185, 129, 0.2);
}

.dark-theme .loading-state,
.dark-theme .empty-state {
  color: rgba(0, 255, 140, 0.8);
  background: rgba(0, 255, 140, 0.05);
  border-color: rgba(0, 255, 140, 0.3);
}

.loading-state p,
.empty-state p {
  margin-top: 20px;
  font-size: 1rem;
  font-weight: 500;
}

.loader {
  width: 32px;
  height: 32px;
  border: 4px solid rgba(16, 185, 129, 0.2);
  border-radius: 50%;
  border-top-color: #10b981;
  animation: spin 1s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.dark-theme .loader {
  border: 4px solid rgba(0, 255, 140, 0.3);
  border-top-color: #00ff8c;
  box-shadow: 0 0 20px rgba(0, 255, 140, 0.5);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Money transfer pattern animations */
.notifications-page::after {
  content: '💰';
  position: absolute;
  top: 15%;
  right: 10%;
  font-size: 2rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
  z-index: 0;
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

/* Financial glow effects */
.notification-item:hover {
  box-shadow:
    0 12px 30px rgba(16, 185, 129, 0.2),
    0 0 20px rgba(16, 185, 129, 0.1);
}

.dark-theme .notification-item:hover {
  box-shadow:
    0 12px 30px rgba(0, 255, 140, 0.25),
    0 0 25px rgba(0, 255, 140, 0.15);
}

/* RTL Support */
[dir='rtl'] .notification-item {
  text-align: right;
}

[dir='rtl'] .notification-date {
  margin-left: 0;
  margin-right: 4px;
}

[dir='rtl'] .notification-item::before {
  left: auto;
  right: 0;
}

@media (max-width: 768px) {
  .notifications-page {
    padding: 20px 15px;
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .action-button {
    flex: 1;
    justify-content: center;
  }

  .notification-filters {
    flex-direction: column;
    gap: 12px;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group input {
    flex: 1;
    width: auto;
  }

  .notification-item {
    padding: 16px;
    gap: 12px;
  }

  .notification-icon {
    width: 36px;
    height: 36px;
  }

  .notification-content h3 {
    font-size: 0.9rem;
  }

  .notification-content p {
    font-size: 0.85rem;
  }
}

/* Enhanced hover effects for better UX */
.action-button,
.action-icon,
.notification-item {
  will-change: transform;
}

/* Smooth transitions for theme switching */
* {
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease,
    box-shadow 0.3s ease;
}
</style>
