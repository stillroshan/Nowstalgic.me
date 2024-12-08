import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import UserProfileCard from '../components/UserProfileCard'
import useTimelineStore from '../stores/timelineStore'
import useAuthStore from '../stores/authStore'
import { FaCalendar, FaClock } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'

const Profile = () => {
  const { username } = useParams()
  const { user: currentUser } = useAuthStore()
  const { fetchUserTimelines, timelines, isLoading } = useTimelineStore()
  const [activeTab, setActiveTab] = useState('timelines')
  
  const isOwnProfile = !username || username === currentUser?.username

  useEffect(() => {
    if (!username) {
      fetchUserTimelines(currentUser?._id)
    } else {
      const userId = currentUser?._id
      fetchUserTimelines(userId)
    }
  }, [username, fetchUserTimelines, currentUser])

  const renderTimelines = () => (
    <div className="grid grid-cols-1 gap-4">
      {timelines.map(timeline => (
        <div key={timeline._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <h3 className="card-title">{timeline.title}</h3>
              <span className="badge badge-ghost">
                {timeline.visibility}
              </span>
            </div>
            
            <p className="text-base-content/70">{timeline.description}</p>
            
            <div className="flex flex-wrap gap-2 my-2">
              {timeline.tags?.map((tag, index) => (
                <span key={index} className="badge badge-primary">{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-base-content/70">
              <span className="flex items-center gap-1">
                <FaCalendar />
                {timeline.events?.length || 0} events
              </span>
              <span className="flex items-center gap-1">
                <FaClock />
                {formatDistanceToNow(new Date(timeline.createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="card-actions justify-end mt-4">
              <Link 
                to={`/timeline/${timeline._id}`}
                className="btn btn-primary btn-sm"
              >
                View Timeline
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      <UserProfileCard showEdit={isOwnProfile} />
      
      <div className="mt-8">
        <div className="tabs tabs-boxed">
          <button 
            className={`tab ${activeTab === 'timelines' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('timelines')}
          >
            Timelines
          </button>
          <button 
            className={`tab ${activeTab === 'likes' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('likes')}
          >
            Likes
          </button>
          <button 
            className={`tab ${activeTab === 'following' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
          <button 
            className={`tab ${activeTab === 'followers' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            Followers
          </button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <>
              {activeTab === 'timelines' && renderTimelines()}
              {activeTab === 'likes' && (
                <div className="text-center text-base-content/70 py-8">
                  Liked timelines will appear here
                </div>
              )}
              {activeTab === 'following' && (
                <div className="text-center text-base-content/70 py-8">
                  Following list will appear here
                </div>
              )}
              {activeTab === 'followers' && (
                <div className="text-center text-base-content/70 py-8">
                  Followers list will appear here
                </div>
              )}
            </>
          )}
        </div>

        {activeTab === 'timelines' && isOwnProfile && (
          <Link 
            to="/create"
            className="btn btn-primary fixed bottom-6 right-6"
          >
            Create New Timeline
          </Link>
        )}
      </div>
    </div>
  )
}

export default Profile 