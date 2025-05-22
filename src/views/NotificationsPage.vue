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

    <!-- <div class="notification-filters">
      <div class="filter-group">
        <label>{{ isArabic ? 'تصفية حسب الحالة:' : 'Filter by status:' }}</label>
        <select v-model="statusFilter">
          <option value="all">{{ isArabic ? 'الكل' : 'All' }}</option>
          <option value="read">{{ isArabic ? 'مقروءة' : 'Read' }}</option>
          <option value="unread">{{ isArabic ? 'غير مقروءة' : 'Unread' }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>{{ isArabic ? 'البحث:' : 'Search:' }}</label>
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="isArabic ? 'بحث في الإشعارات...' : 'Search notifications...'"
        />
      </div>
    </div> -->

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
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.dark-theme .page-header h1 {
  color: #f0f0f0;
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
  background: rgba(80, 19, 39, 0.8);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark-theme .action-button {
  background: rgba(138, 42, 68, 0.8);
}

.action-button:hover {
  background: rgba(99, 12, 41, 1);
  transform: translateY(-1px);
}

.dark-theme .action-button:hover {
  background: rgba(138, 42, 68, 1);
}

.notification-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.dark-theme .notification-filters {
  background: rgba(30, 30, 40, 0.5);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-size: 0.9rem;
  color: #555;
}

.dark-theme .filter-group label {
  color: #aaa;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.dark-theme .filter-group select,
.dark-theme .filter-group input {
  background: rgba(40, 40, 50, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

.filter-group input {
  width: 220px;
}

.notifications-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notification-item-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-date {
  font-size: 0.85rem;
  font-weight: 600;
  color: #777;
  margin-left: 4px;
}

.dark-theme .notification-date {
  color: #aaa;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.dark-theme .notification-item {
  background: rgba(40, 40, 50, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
}

.dark-theme .notification-item:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.25);
}

.notification-item.is-read {
  opacity: 0.8;
}

.notification-icon {
  width: 40px;
  height: 40px;
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

.notification-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 6px;
  color: #333;
}

.dark-theme .notification-content h3 {
  color: #f0f0f0;
}

.notification-content p {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.dark-theme .notification-content p {
  color: #bbb;
}

.notification-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
}

.dark-theme .notification-meta {
  color: #999;
}

.status {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.05);
  color: #888;
  font-weight: 500;
}

.status.unread {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.dark-theme .status {
  background: rgba(255, 255, 255, 0.1);
  color: #999;
}

.dark-theme .status.unread {
  background: rgba(229, 62, 62, 0.15);
  color: #ff5e5e;
}

.notification-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-icon {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-icon:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.dark-theme .action-icon {
  color: #999;
}

.dark-theme .action-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #888;
}

.dark-theme .loading-state,
.dark-theme .empty-state {
  color: #999;
}

.loading-state p,
.empty-state p {
  margin-top: 20px;
  font-size: 1rem;
}

.loader {
  width: 32px;
  height: 32px;
  border: 4px solid rgba(138, 42, 68, 0.2);
  border-radius: 50%;
  border-top-color: rgba(138, 42, 68, 0.8);
  animation: spin 1s ease-in-out infinite;
}

.dark-theme .loader {
  border: 4px solid rgba(138, 42, 68, 0.3);
  border-top-color: rgba(138, 42, 68, 0.8);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* RTL Support */
[dir='rtl'] .notification-item {
  text-align: right;
}

[dir='rtl'] .notification-date {
  margin-left: 0;
  margin-right: 4px;
}

@media (max-width: 768px) {
  .notifications-page {
    padding: 20px 15px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
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
}
</style>
