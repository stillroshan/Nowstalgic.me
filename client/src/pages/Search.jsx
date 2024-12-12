import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import useSearchStore from '../stores/searchStore'
import { useDebounce } from '../hooks/useDebounce'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const debouncedQuery = useDebounce(query, 300)
  const navigate = useNavigate()
  
  const { 
    searchResults, 
    suggestions,
    isLoading, 
    filters,
    search,
    getSuggestions,
    setFilters,
    clearResults 
  } = useSearchStore()

  // Handle suggestions while typing
  useEffect(() => {
    if (debouncedQuery) {
      getSuggestions(debouncedQuery)
    } else {
      clearResults()
    }
  }, [debouncedQuery, getSuggestions, clearResults])

  // Handle full search on enter or filter change
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      search(q, filters)
      setQuery(q)
    }
  }, [searchParams, filters, search])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 items-center mb-6">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="text"
            placeholder="Search users, timelines, events..."
            className="input input-bordered w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            className="select select-bordered select-sm"
            value={filters.sortBy}
            onChange={(e) => setFilters({ sortBy: e.target.value })}
          >
            <option value="relevance">Most Relevant</option>
            <option value="date">Most Recent</option>
            <option value="popularity">Most Popular</option>
          </select>

          <select
            className="select select-bordered select-sm"
            value={filters.timeRange}
            onChange={(e) => setFilters({ timeRange: e.target.value })}
          >
            <option value="all">All Time</option>
            <option value="day">24 Hours</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Live Suggestions */}
      {suggestions.length > 0 && query && !searchParams.get('q') && (
        <div className="absolute mt-1 w-full max-w-4xl bg-base-100 rounded-box shadow-lg z-50">
          <div className="py-2">
            {suggestions.map(item => (
              <button
                key={item._id}
                onClick={() => setSearchParams({ q: item.username || item.title })}
                className="flex items-center gap-3 px-4 py-2 w-full hover:bg-base-200 text-left"
              >
                {item.type === 'user' ? (
                  <>
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img src={item.profilePicture || '/default-avatar.png'} alt={item.username} />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{item.username}</div>
                      <div className="text-sm text-base-content/70">
                        {item.bio?.substring(0, 50) || 'No bio'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-base-content/70">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Type Tabs */}
      {searchParams.get('q') && (
        <div className="tabs tabs-boxed mb-6">
          <button 
            className={`tab ${filters.type === 'all' ? 'tab-active' : ''}`}
            onClick={() => setFilters({ type: 'all' })}
          >
            All
          </button>
          <button 
            className={`tab ${filters.type === 'users' ? 'tab-active' : ''}`}
            onClick={() => setFilters({ type: 'users' })}
          >
            Users ({searchResults.users.length})
          </button>
          <button 
            className={`tab ${filters.type === 'timelines' ? 'tab-active' : ''}`}
            onClick={() => setFilters({ type: 'timelines' })}
          >
            Timelines ({searchResults.timelines.length})
          </button>
          <button 
            className={`tab ${filters.type === 'events' ? 'tab-active' : ''}`}
            onClick={() => setFilters({ type: 'events' })}
          >
            Events ({searchResults.events.length})
          </button>
        </div>
      )}

      {/* Search Results */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : searchParams.get('q') ? (
        <div className="space-y-6">
          {/* Users Section */}
          {(filters.type === 'all' || filters.type === 'users') && searchResults.users.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Users</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.users.map(user => (
                  <div 
                    key={user._id} 
                    className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    <div className="card-body">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-12 rounded-full">
                            <img src={user.profilePicture || '/default-avatar.png'} alt={user.username} />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold">{user.username}</h4>
                          <p className="text-sm text-base-content/70">{user.bio}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timelines Section */}
          {(filters.type === 'all' || filters.type === 'timelines') && searchResults.timelines.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Timelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.timelines.map(timeline => (
                  <div 
                    key={timeline._id} 
                    className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
                    onClick={() => navigate(`/timeline/${timeline._id}`)}
                  >
                    <div className="card-body">
                      <h4 className="card-title">{timeline.title}</h4>
                      <p className="text-sm text-base-content/70">{timeline.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="avatar">
                          <div className="w-6 rounded-full">
                            <img src={timeline.user.profilePicture || '/default-avatar.png'} alt={timeline.user.username} />
                          </div>
                        </div>
                        <span className="text-sm">{timeline.user.username}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {timeline.tags?.map((tag, index) => (
                          <span key={index} className="badge badge-outline">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          {(filters.type === 'all' || filters.type === 'events') && searchResults.events.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.events.map(event => (
                  <div 
                    key={event._id} 
                    className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
                    onClick={() => navigate(`/timeline/${event.timeline._id}/event/${event._id}`)}
                  >
                    <div className="card-body">
                      <h4 className="card-title">{event.title}</h4>
                      <p className="text-sm text-base-content/70">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                        {event.location && (
                          <span className="text-sm text-base-content/70">• {event.location}</span>
                        )}
                      </div>
                      <div className="text-sm mt-1">
                        Timeline: {event.timeline.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {!searchResults.users.length && !searchResults.timelines.length && !searchResults.events.length && (
            <p className="text-center text-base-content/70">No results found</p>
          )}
        </div>
      ) : (
        <p className="text-center text-base-content/70">Enter a search term to begin...</p>
      )}
    </div>
  )
}

export default Search 