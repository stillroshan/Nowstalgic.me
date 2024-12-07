import { useParams } from 'react-router-dom'
import EventForm from '../components/EventForm'

const CreateEvent = () => {
  const { timelineId } = useParams()

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
      <EventForm timelineId={timelineId} />
    </div>
  )
}

export default CreateEvent 