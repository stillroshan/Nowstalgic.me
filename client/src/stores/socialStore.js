import { create } from 'zustand'
import axios from 'axios'

const useSocialStore = create((set) => ({
  followers: [],
  following: [],
  isLoading: false,
  error: null,

  followUser: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`/api/users/${userId}/follow`)
      set(state => ({
        following: [...state.following, response.data.data],
        isLoading: false
      }))
      return response.data.data
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to follow user',
        isLoading: false 
      })
      throw error
    }
  },

  unfollowUser: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`/api/users/${userId}/unfollow`)
      set(state => ({
        following: state.following.filter(user => user._id !== userId),
        isLoading: false
      }))
      return response.data.data
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to unfollow user',
        isLoading: false 
      })
      throw error
    }
  },

  getFollowers: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`/api/users/${userId}/followers`)
      set({ followers: response.data.data, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch followers',
        isLoading: false 
      })
    }
  },

  getFollowing: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`/api/users/${userId}/following`)
      set({ following: response.data.data, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch following',
        isLoading: false 
      })
    }
  }
}))

export default useSocialStore 