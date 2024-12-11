import { create } from 'zustand'
import axios from 'axios'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setToken: (token) => {
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    set({ isAuthenticated: true })
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      
      // Set the token in localStorage and axios headers
      localStorage.setItem('token', response.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      
      // Update the store state
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      })
      
      return true // Return true to indicate successful login
    } catch (error) {
      set({ 
        user: null,
        isAuthenticated: false,
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      })
      return false // Return false to indicate failed login
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password,
      })
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false 
      })
      localStorage.setItem('token', response.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    set({ user: null, isAuthenticated: false })
  },

  // Add initialization function
  initialize: async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await axios.get('/api/auth/me')
        set({ 
          user: response.data, 
          isAuthenticated: true,
          error: null
        })
      } catch (error) {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        set({ 
          user: null, 
          isAuthenticated: false,
          error: error.response?.data?.message || 'Session expired'
        })
      }
    }
  },

  updateUserSettings: async (type, settings) => {
    set({ isLoading: true, error: null })
    try {
      let response;
      if (type === 'profile') {
        // Use PUT for profile updates
        response = await axios.put('/api/users/profile', settings)
      } else {
        // Use PATCH for other settings
        response = await axios.patch(`/api/users/settings/${type}`, settings)
      }
      
      set(state => ({ 
        user: { ...state.user, ...response.data.user },
        isLoading: false 
      }))
      return true
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update settings', 
        isLoading: false 
      })
      return false
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null })
    try {
      await axios.post('/api/users/change-password', {
        currentPassword,
        newPassword
      })
      set({ isLoading: false })
      return true
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update password', 
        isLoading: false 
      })
      return false
    }
  },

  deleteAccount: async (password) => {
    set({ isLoading: true, error: null })
    try {
      await axios.post('/api/users/delete-account', { password })
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      set({ user: null, isAuthenticated: false, isLoading: false })
      return true
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete account', 
        isLoading: false 
      })
      return false
    }
  }
}))

export default useAuthStore 