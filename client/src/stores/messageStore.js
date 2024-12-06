import { create } from 'zustand'
import axios from 'axios'
import socket from '../utils/socket'

const useMessageStore = create((set) => ({
  conversations: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  error: null,

  initializeSocket: () => {
    socket.on('newMessage', (message) => {
      set(state => ({
        messages: [...state.messages, message],
        conversations: state.conversations.map(conv => {
          if (conv.user._id === message.sender._id) {
            return {
              ...conv,
              lastMessage: message,
              unreadCount: conv.unreadCount + 1
            }
          }
          return conv
        })
      }))
    })

    socket.on('messagesRead', (readerId) => {
      set(state => ({
        messages: state.messages.map(msg => 
          msg.sender._id === readerId ? { ...msg, read: true } : msg
        )
      }))
    })
  },

  getConversations: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get('/api/messages/conversations')
      set({ conversations: response.data.data, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch conversations',
        isLoading: false 
      })
    }
  },

  getMessages: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`/api/messages/${userId}`)
      set({ 
        messages: response.data.data,
        currentChat: userId,
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch messages',
        isLoading: false 
      })
    }
  },

  sendMessage: async (recipientId, content) => {
    try {
      const response = await axios.post('/api/messages', {
        recipient: recipientId,
        content
      })
      set(state => ({
        messages: [...state.messages, response.data.data],
        conversations: state.conversations.map(conv => {
          if (conv.user._id === recipientId) {
            return {
              ...conv,
              lastMessage: response.data.data
            }
          }
          return conv
        })
      }))
      return response.data.data
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to send message' })
      throw error
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axios.delete(`/api/messages/${messageId}`)
      set(state => ({
        messages: state.messages.filter(msg => msg._id !== messageId)
      }))
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete message' })
      throw error
    }
  }
}))

export default useMessageStore 