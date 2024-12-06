import { Link } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import UserProfileCard from './UserProfileCard'

const RightSidebar = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="w-80 p-4 space-y-6">
      {!isAuthenticated ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold mb-4">Welcome to Nowstalgic</h3>
            <div className="space-y-2">
              <Link to="/login" className="btn btn-primary w-full">
                Log in
              </Link>
              <Link to="/register" className="btn btn-outline w-full">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <UserProfileCard />
      )}

      {/* Suggested Users */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="font-semibold mb-4">Suggested Users</h3>
          <div className="space-y-4">
            {/* Sample suggested users - replace with real data */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img src={`https://via.placeholder.com/40?text=User${i}`} alt={`User ${i}`} />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">User {i}</p>
                    <p className="text-sm text-base-content/70">@user{i}</p>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline">Follow</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="text-sm text-base-content/70">
        <div className="flex flex-wrap gap-2">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/help" className="hover:underline">Help</Link>
        </div>
        <p className="mt-2">© 2024 Nowstalgic</p>
      </div>
    </div>
  )
}

export default RightSidebar 