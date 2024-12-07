import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import useEventStore from '../stores/eventStore'
import useTimelineStore from '../stores/timelineStore'
import useAuthStore from '../stores/authStore'
import { formatDistanceToNow } from 'date-fns'
import { FaHeart, FaComment, FaShare } from 'react-icons/fa'

const TimelineView = ({ timelineId }) => {
  const { events, isLoading, error, fetchTimelineEvents, toggleLike } = useEventStore()
  const { currentTimeline, fetchTimelineById } = useTimelineStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchTimelineById(timelineId)
    fetchTimelineEvents(timelineId)
  }, [timelineId, fetchTimelineById, fetchTimelineEvents])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      {currentTimeline && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{currentTimeline.title}</h2>
            <p>{currentTimeline.description}</p>
            <div className="card-actions justify-end">
              <Link 
                to={`/timeline/${timelineId}/create-event`}
                className="btn btn-primary"
              >
                Add Event
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      {events.map(event => (
        <div key={event._id} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <h3 className="card-title">{event.title}</h3>
              <span className="text-sm text-base-content/70">
                {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
              </span>
            </div>
            
            <p>{event.description}</p>
            
            {/* Media Gallery */}
            {event.media && event.media.length > 0 && (
              <div className="grid grid-cols-2 gap-2 my-4">
                {event.media.map((media, index) => (
                  <div key={index} className="relative aspect-square">
                    {media.type === 'image' ? (
                      <img 
                        src={media.url} 
                        alt={`Event media ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <video 
                        src={media.url}
                        controls
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Event Metadata */}
            <div className="flex items-center gap-4 text-sm text-base-content/70">
              {event.location && (
                <span> {event.location}</span>
              )}
              <span className="badge badge-outline">{event.category}</span>
            </div>

            {/* Actions */}
            <div className="card-actions justify-end mt-4">
              <button 
                className={`btn btn-ghost btn-sm gap-2 ${
                  event.likes?.includes(user?._id) ? 'text-primary' : ''
                }`}
                onClick={() => toggleLike(event._id)}
              >
                <FaHeart /> {event.likes?.length || 0}
              </button>
              <button className="btn btn-ghost btn-sm gap-2">
                <FaComment /> {event.comments?.length || 0}
              </button>
              <button className="btn btn-ghost btn-sm">
                <FaShare />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

TimelineView.propTypes = {
  timelineId: PropTypes.string.isRequired
}

export default TimelineView