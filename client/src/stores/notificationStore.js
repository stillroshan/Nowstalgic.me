import { create } from 'zustand'
import axios from 'axios'
import socket from '../utils/socket'

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  initializeSocket: () => {
    socket.on('notification', (notification) => {
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }))
    })
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get('/api/notifications')
      set({ 
        notifications: response.data.data,
        unreadCount: response.data.data.filter(n => !n.read).length,
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch notifications',
        isLoading: false 
      })
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`)
      set(state => ({
        notifications: state.notifications.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1
      }))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  },

  markAllAsRead: async () => {
    try {
      await axios.patch('/api/notifications/read-all')
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }))
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }
}))

export default useNotificationStore