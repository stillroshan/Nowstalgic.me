import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BiSearch } from 'react-icons/bi'
import useSearchStore from '../stores/searchStore'
import { useDebounce } from '../hooks/useDebounce'

const SearchBar = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const { suggestions, isLoading, getSuggestions, clearResults } = useSearchStore()
  const searchRef = useRef(null)

  useEffect(() => {
    if (debouncedQuery) {
      getSuggestions(debouncedQuery)
    } else {
      clearResults()
    }
  }, [debouncedQuery, getSuggestions, clearResults])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="form-control">
        <div className="input-group">
          <input
            type="text"
            placeholder="Search users, timelines, events..."
            className="input input-bordered w-64"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
          />
          <button type="submit" className="btn btn-square">
            <BiSearch className="h-5 w-5" />
          </button>
        </div>
      </form>

      {isOpen && (query || isLoading) && (
        <div className="absolute mt-1 w-full bg-base-100 rounded-box shadow-lg z-50">
          {isLoading ? (
            <div className="p-4 text-center">
              <span className="loading loading-spinner loading-sm" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map(user => (
                <Link
                  key={user._id}
                  to={`/profile/${user._id}`}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-base-200"
                  onClick={() => {
                    setIsOpen(false)
                    setQuery('')
                  }}
                >
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img 
                        src={user.profilePicture || '/default-avatar.png'} 
                        alt={user.username} 
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-base-content/70">
                      {user.bio?.substring(0, 50) || 'No bio'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query && (
            <div className="p-4 text-center text-base-content/70">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar 