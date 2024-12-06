import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import useAuthStore from '../stores/authStore'

const UserProfileCard = ({ showEdit = false }) => {
  const { user } = useAuthStore()

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-24 rounded-full">
              <img 
                src={user?.profilePicture || "https://via.placeholder.com/96"} 
                alt={user?.username} 
              />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.username}</h2>
            <p className="text-base-content/70">@{user?.username?.toLowerCase()}</p>
            {showEdit && (
              <Link to="/settings/profile" className="btn btn-outline btn-sm mt-2">
                Edit Profile
              </Link>
            )}
          </div>
        </div>
        <p className="mt-4">{user?.bio || "No bio yet."}</p>
        <div className="flex gap-4 mt-2">
          <div>
            <div className="stat-value text-lg">{user?.followersCount || 0}</div>
            <div className="text-sm text-base-content/70">Followers</div>
          </div>
          <div>
            <div className="stat-value text-lg">{user?.followingCount || 0}</div>
            <div className="text-sm text-base-content/70">Following</div>
          </div>
          <div>
            <div className="stat-value text-lg">{user?.timelinesCount || 0}</div>
            <div className="text-sm text-base-content/70">Timelines</div>
          </div>
        </div>
      </div>
    </div>
  )
}

UserProfileCard.propTypes = {
  showEdit: PropTypes.bool
}

export default UserProfileCard 