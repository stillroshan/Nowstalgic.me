import { create } from 'zustand'
import axios from 'axios'

const useSearchStore = create((set) => ({
  searchResults: [],
  isLoading: false,
  error: null,

  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], isLoading: false })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`/api/users/search?q=${query}`)
      set({ searchResults: response.data.data, isLoading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Search failed',
        isLoading: false 
      })
    }
  },

  clearResults: () => {
    set({ searchResults: [], error: null })
  }
}))

export default useSearchStore 