const Home = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* Timeline Entry Example */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src="https://via.placeholder.com/40" alt="user" />
                </div>
              </div>
              <div>
                <h3 className="font-bold">John Doe</h3>
                <p className="text-sm text-base-content/70">2 hours ago</p>
              </div>
            </div>
            <p>Started my first day at the new job! 🎉</p>
            <div className="card-actions justify-end">
              <button className="btn btn-ghost btn-sm">❤️ Like</button>
              <button className="btn btn-ghost btn-sm">💬 Comment</button>
              <button className="btn btn-ghost btn-sm">↗️ Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 