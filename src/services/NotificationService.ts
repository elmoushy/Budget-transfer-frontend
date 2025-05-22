// NotificationService.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

// API base URL
const API_BASE_URL = 'http://localhost:8000/api/auth/Notifications'

// Interface for notification object
export interface Notification {
  id: number
  message: string
  is_read: boolean
  created_at: string
  is_shown: boolean
  is_system_read: boolean
}

export interface SystemNotificationResponse {
  Number_Of_Notifications: number
}

export interface NotificationsResponse {
  notifications: Notification[]
  count?: number
}

class NotificationService {
  // Get unread notifications
  async getUnreadNotifications(): Promise<NotificationsResponse> {
    const authStore = useAuthStore()
    const token = authStore.token

    try {
      const response = await axios.get(`${API_BASE_URL}/unread`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching unread notifications:', error)
      return { notifications: [] }
    }
  }

  // Get system notifications (check if there are any new ones)
  async checkSystemNotifications(): Promise<SystemNotificationResponse> {
    const authStore = useAuthStore()
    const token = authStore.token

    try {
      const response = await axios.get(`${API_BASE_URL}/system`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error checking system notifications:', error)
      return { Number_Of_Notifications: 0 }
    }
  }

  // Get all notifications (both read and unread)
  async getAllNotifications(): Promise<NotificationsResponse> {
    const authStore = useAuthStore()
    const token = authStore.token

    try {
      const response = await axios.get(`${API_BASE_URL}/get_all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching all notifications:', error)
      return { notifications: [] }
    }
  }

  // Mark a single notification as read
  async markNotificationAsRead(notificationId: number): Promise<void> {
    const authStore = useAuthStore()
    const token = authStore.token

    try {
      await axios.put(
        `${API_BASE_URL}/read_one?notification_id=${notificationId}`,
        { notification_id: notificationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error)
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<void> {
    const authStore = useAuthStore()
    const token = authStore.token

    try {
      await axios.put(
        `${API_BASE_URL}/read_all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Delete a notification
  async deleteNotification(notificationId: number): Promise<void> {
    const authStore = useAuthStore()
    const token = authStore.token

    try {
      await axios.put(
        `${API_BASE_URL}/delete?notification_id=${notificationId}`,
        { notification_id: notificationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error)
    }
  }
}

export const notificationService = new NotificationService()
export default notificationService
