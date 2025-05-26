// NotificationService.ts
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { API_BASE_URL, ENDPOINTS } from '@/config/api'

// Define the notification endpoint URL
const NOTIFICATION_ENDPOINT = `${API_BASE_URL}${ENDPOINTS.AUTH.NOTIFICATIONS}`

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
      const response = await axios.get(`${NOTIFICATION_ENDPOINT}/unread`, {
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
  // COMMENTED OUT: Stopping use of api/auth/Notifications/system endpoint
  async checkSystemNotifications(): Promise<SystemNotificationResponse> {
    // const authStore = useAuthStore()
    // const token = authStore.token

    // try {
    //   const response = await axios.get(`${NOTIFICATION_ENDPOINT}/system`, {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   })
    //   return response.data
    // } catch (error) {
    //   console.error('Error checking system notifications:', error)
    //   return { Number_Of_Notifications: 0 }
    // }
    console.log('System notifications endpoint disabled')
    return { Number_Of_Notifications: 0 }
  }

  // Get all notifications (both read and unread)
  async getAllNotifications(): Promise<NotificationsResponse> {
    const authStore = useAuthStore()
    const token = authStore.token

    try {
      const response = await axios.get(`${NOTIFICATION_ENDPOINT}/get_all`, {
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
        `${NOTIFICATION_ENDPOINT}/read_one?notification_id=${notificationId}`,
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
        `${NOTIFICATION_ENDPOINT}/read_all`,
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
        `${NOTIFICATION_ENDPOINT}/delete?notification_id=${notificationId}`,
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
