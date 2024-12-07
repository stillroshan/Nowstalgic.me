import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import TimelineView from '../components/TimelineView'
import useTimelineStore from '../stores/timelineStore'
import { FaPlus } from 'react-icons/fa'

const Timeline = () => {
  const { timelineId } = useParams()
  const { currentTimeline, fetchTimelineById, isLoading, error } = useTimelineStore()

  useEffect(() => {
    fetchTimelineById(timelineId)
  }, [timelineId, fetchTimelineById])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-3xl mx-auto">
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Timeline Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{currentTimeline?.title}</h1>
          <p className="text-base-content/70">{currentTimeline?.description}</p>
        </div>
        <Link 
          to={`/timeline/${timelineId}/create-event`}
          className="btn btn-primary"
        >
          <FaPlus className="mr-2" />
          Add Event
        </Link>
      </div>

      {/* Timeline Content */}
      <TimelineView timelineId={timelineId} />
    </div>
  )
}

export default Timeline 