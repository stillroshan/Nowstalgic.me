import { create } from 'zustand'
import axios from 'axios'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

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
  }
}))

export default useAuthStore 