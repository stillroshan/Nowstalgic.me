import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useSocialStore from '../stores/socialStore'
import FollowButton from './FollowButton'
import PropTypes from 'prop-types'

const UserProfileCard = ({ userId, showEdit = false }) => {
  const { user } = useAuthStore()
  const { followers, following, getFollowers, getFollowing } = useSocialStore()
  const isOwnProfile = !userId || userId === user?._id

  useEffect(() => {
    if (userId) {
      getFollowers(userId)
      getFollowing(userId)
    }
  }, [userId, getFollowers, getFollowing])

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
            {isOwnProfile ? (
              showEdit && (
                <Link to="/settings/profile" className="btn btn-outline btn-sm mt-2">
                  Edit Profile
                </Link>
              )
            ) : (
              <div className="flex gap-2 mt-2">
                <FollowButton 
                  userId={userId}
                  initialIsFollowing={following.some(f => f._id === userId)}
                />
                <Link to={`/messages/${userId}`} className="btn btn-outline btn-sm">
                  Message
                </Link>
              </div>
            )}
          </div>
        </div>
        <p className="mt-4">{user?.bio || "No bio yet."}</p>
        <div className="flex gap-4 mt-2">
          <Link to={`/profile/${userId || user?._id}/followers`} className="hover:underline">
            <div className="stat-value text-lg">{followers.length}</div>
            <div className="text-sm text-base-content/70">Followers</div>
          </Link>
          <Link to={`/profile/${userId || user?._id}/following`} className="hover:underline">
            <div className="stat-value text-lg">{following.length}</div>
            <div className="text-sm text-base-content/70">Following</div>
          </Link>
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
  userId: PropTypes.string,
  showEdit: PropTypes.bool
}

export default UserProfileCard 