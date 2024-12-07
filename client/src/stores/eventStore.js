import { create } from 'zustand'
import axios from 'axios'

const useEventStore = create((set) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

  createEvent: async (eventData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post('/api/events', eventData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      set(state => ({ 
        events: [...state.events, response.data.data],
        isLoading: false 
      }))
      return response.data.data
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create event', 
        isLoading: false 
      })
      return null
    }
  },

  fetchTimelineEvents: async (timelineId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`/api/events?timeline=${timelineId}`)
      set({ events: response.data.data, isLoading: false })
      return response.data.data
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch events', 
        isLoading: false 
      })
      return null
    }
  },

  toggleLike: async (eventId) => {
    try {
      const response = await axios.post(`/api/events/${eventId}/like`)
      set(state => ({
        events: state.events.map(event => 
          event._id === eventId ? response.data.data : event
        )
      }))
      return response.data.data
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  },

  addComment: async (eventId, text) => {
    try {
      const response = await axios.post(`/api/events/${eventId}/comment`, { text })
      set(state => ({
        events: state.events.map(event => 
          event._id === eventId ? response.data.data : event
        )
      }))
      return response.data.data
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }
}))

export default useEventStore 