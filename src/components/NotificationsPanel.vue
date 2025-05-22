<!-- NotificationsPanel.vue -->
<template>  <div 
    class="notifications-panel" 
    :class="{ 
      active: isActive, 
      'dark-theme': isDarkMode, 
      'rtl': isArabic 
    }"
  >
    <div class="panel-header">
      <h3>{{ isArabic ? 'الإشعارات' : 'Notifications' }}</h3>
      <div class="actions">
        <button class="action-btn mark-all" @click="markAllAsRead">
          {{ isArabic ? 'تعليم كمقروءة' : 'Mark all as read' }}
        </button>
        <button class="close-btn" @click="closePanel">
          <X size="18" />
        </button>
      </div>
    </div>
    
    <div class="panel-content">
      <div v-if="notifications.length === 0" class="empty-state">
        <Bell size="32" />
        <p>{{ isArabic ? 'ليس لديك إشعارات جديدة' : 'You have no new notifications' }}</p>
      </div>
      
      <template v-else>
        <div 
          v-for="(notification, index) in notifications" 
          :key="index"
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="readNotification(index)"
        >
          <div class="notification-icon" :class="notification.type">
            <component :is="getIconForType(notification.type)" size="18" />
          </div>
          <div class="notification-content">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
            <span class="timestamp">{{ formatTime(notification.timestamp) }}</span>
          </div>
          <div class="notification-actions">
            <button class="action-btn" @click.stop="removeNotification(index)">
              <Trash2 size="16" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { Bell, AlertTriangle, CheckCircle, FileText, DollarSign, X, Trash2, User } from 'lucide-vue-next'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')

// Mock notifications data
const notifications = ref([
  {
    type: 'success',
    title: isArabic.value ? 'تم تحديث الميزانية' : 'Budget Updated',
    message: isArabic.value 
      ? 'تم تحديث ميزانية قسم تكنولوجيا المعلومات بنجاح'
      : 'IT Department budget has been successfully updated.',
    timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    read: false
  },
  {
    type: 'warning',
    title: isArabic.value ? 'طلب تحويل في انتظار الموافقة' : 'Transfer Request Pending',
    message: isArabic.value 
      ? 'طلب تحويل #TR-2025-053 بحاجة للموافقة'
      : 'Transfer request #TR-2025-053 is waiting for your approval.',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    read: false
  },
  {
    type: 'info',
    title: isArabic.value ? 'تم تحديث النظام' : 'System Update',
    message: isArabic.value 
      ? 'تم تحديث النظام إلى الإصدار 2.4.0، اطلع على الميزات الجديدة'
      : 'System has been updated to version 2.4.0. Check out new features!',
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    read: true
  },
  {
    type: 'danger',
    title: isArabic.value ? 'تجاوز ميزانية' : 'Budget Exceeded',
    message: isArabic.value 
      ? 'تجاوزت ميزانية قسم التسويق الحد المخصص لهذا الربع'
      : 'Marketing department has exceeded budget limit for this quarter.',
    timestamp: new Date(Date.now() - 259200000), // 3 days ago
    read: true
  },
  {
    type: 'user',
    title: isArabic.value ? 'مستخدم جديد' : 'New User Added',
    message: isArabic.value 
      ? 'تم إضافة محمد أحمد كمستخدم جديد في النظام'
      : 'Mohammed Ahmed has been added as a new user to the system.',
    timestamp: new Date(Date.now() - 345600000), // 4 days ago
    read: true
  }
])

// Get appropriate icon based on notification type
function getIconForType(type: string) {
  switch (type) {
    case 'success': return CheckCircle
    case 'warning': return AlertTriangle
    case 'info': return FileText
    case 'danger': return DollarSign
    case 'user': return User
    default: return Bell
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
function readNotification(index: number) {
  notifications.value[index].read = true
}

// Mark all notifications as read
function markAllAsRead() {
  notifications.value = notifications.value.map(notification => {
    return { ...notification, read: true }
  })
}

// Remove a notification
function removeNotification(index: number) {
  notifications.value.splice(index, 1)
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

.action-btn.mark-all {
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

.empty-state {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.dark-theme .empty-state {
  color: #777;
}

.empty-state p {
  margin-top: 15px;
  text-align: center;
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
</style>
