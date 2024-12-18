import { create } from 'zustand'
import axios from 'axios'

const useTimelineStore = create((set, get) => ({
  timelines: [],
  currentTimeline: null,
  isLoading: false,
  error: null,

  fetchTimelines: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get('/api/timelines')
      set({ timelines: response.data.data, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch timelines', 
        isLoading: false 
      })
    }
  },

  createTimeline: async (timelineData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post('/api/timelines', timelineData)
      set(state => ({ 
        timelines: [...state.timelines, response.data.data],
        isLoading: false 
      }))
      return response.data.data
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create timeline', 
        isLoading: false 
      })
      return null
    }
  },

  fetchTimelineById: async (id) => {
    const state = get()
    if (state.currentTimeline?._id === id) return state.currentTimeline
    
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`/api/timelines/${id}`)
      set({ currentTimeline: response.data.data, isLoading: false })
      return response.data.data
    } catch (error) {
      if (error.response?.status === 429) {
        set({ 
          error: 'Too many requests. Please wait a moment before trying again.',
          isLoading: false 
        })
      } else {
        set({ 
          error: error.response?.data?.message || 'Failed to fetch timeline',
          isLoading: false 
        })
      }
      return null
    }
  },

  fetchUserTimelines: async (userId) => {
    if (!userId) return;
    
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`/api/timelines/user/${userId}`)
      set({ 
        timelines: response.data.data,
        isLoading: false 
      })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch user timelines',
        isLoading: false 
      })
    }
  },

  clearCurrentTimeline: () => {
    set({ currentTimeline: null })
  }
}))

export default useTimelineStore 