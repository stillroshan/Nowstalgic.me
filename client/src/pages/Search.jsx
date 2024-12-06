const Search = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="form-control mb-6">
        <input 
          type="text" 
          placeholder="Search timelines, events, or users..." 
          className="input input-bordered w-full"
        />
      </div>
      <div className="space-y-4">
        <p className="text-base-content/70">Enter a search term to begin...</p>
      </div>
    </div>
  )
}

export default Search 