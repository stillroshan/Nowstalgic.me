import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import UserProfileCard from '../components/UserProfileCard'
import useTimelineStore from '../stores/timelineStore'
import useAuthStore from '../stores/authStore'

const Profile = () => {
  const { username } = useParams()
  const { user: currentUser } = useAuthStore()
  const { fetchUserTimelines, timelines, isLoading } = useTimelineStore()
  const [activeTab, setActiveTab] = useState('timelines')
  
  const isOwnProfile = !username || username === currentUser?.username

  useEffect(() => {
    fetchUserTimelines(username)
  }, [username, fetchUserTimelines])

  return (
    <div className="max-w-4xl mx-auto">
      <UserProfileCard showEdit={isOwnProfile} />
      
      <div className="tabs tabs-boxed my-6">
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

      {isLoading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {timelines.map(timeline => (
            <div key={timeline._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">{timeline.title}</h3>
                <p>{timeline.description}</p>
                <div className="card-actions justify-end">
                  <span className="text-sm text-base-content/70">
                    {timeline.events?.length || 0} events
                  </span>
                  <button className="btn btn-primary btn-sm">
                    View Timeline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile 