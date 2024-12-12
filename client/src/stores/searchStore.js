import { create } from 'zustand'
import axios from 'axios'

const useSearchStore = create((set) => ({
  searchResults: {
    users: [],
    timelines: [],
    events: []
  },
  suggestions: [],
  isLoading: false,
  error: null,
  filters: {
    type: 'all', // all, users, timelines, events
    sortBy: 'relevance', // relevance, date, popularity
    timeRange: 'all', // all, day, week, month, year
    visibility: 'all' // all, public, private, followers
  },

  // For instant suggestions
  getSuggestions: async (query) => {
    if (!query.trim()) {
      set({ suggestions: [], isLoading: false })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`/api/search/suggestions?q=${query}`)
      set({ suggestions: response.data.data, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch suggestions',
        isLoading: false 
      })
    }
  },

  // For full search with filters
  search: async (query, filters) => {
    if (!query.trim()) {
      set({ searchResults: { users: [], timelines: [], events: [] }, isLoading: false })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const response = await axios.get('/api/search', {
        params: {
          q: query,
          ...filters
        }
      })
      set({ searchResults: response.data.data, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Search failed',
        isLoading: false 
      })
    }
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  },

  clearResults: () => {
    set({ 
      searchResults: { users: [], timelines: [], events: [] },
      suggestions: [],
      error: null 
    })
  }
}))

export default useSearchStore 