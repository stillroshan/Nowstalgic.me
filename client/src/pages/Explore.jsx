const Explore = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Explore</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder content */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Trending Timeline #{item}</h3>
              <p>This is a sample timeline description.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Explore 