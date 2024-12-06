import { useState } from 'react'
import PropTypes from 'prop-types'
import useSocialStore from '../stores/socialStore'

const FollowButton = ({ userId, initialIsFollowing = false }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const { followUser, unfollowUser } = useSocialStore()

  const handleFollow = async () => {
    setIsLoading(true)
    try {
      if (isFollowing) {
        await unfollowUser(userId)
        setIsFollowing(false)
      } else {
        await followUser(userId)
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`btn btn-sm ${
        isFollowing ? 'btn-outline' : 'btn-primary'
      }`}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        isFollowing ? 'Following' : 'Follow'
      )}
    </button>
  )
}

FollowButton.propTypes = {
  userId: PropTypes.string.isRequired,
  initialIsFollowing: PropTypes.bool
}

export default FollowButton 