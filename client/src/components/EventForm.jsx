import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaImage, FaTimes } from 'react-icons/fa'
import PropTypes from 'prop-types'
import useEventStore from '../stores/eventStore'

const EventForm = ({ timelineId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'personal',
    visibility: 'public',
    media: []
  })
  const [mediaFiles, setMediaFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const { createEvent } = useEventStore()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    )
    
    setMediaFiles(prev => [...prev, ...validFiles])
  }

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formDataToSend = new FormData()
      
      // Append event data
      Object.keys(formData).forEach(key => {
        if (key !== 'media') {
          formDataToSend.append(key, formData[key])
        }
      })
      
      // Append timeline ID
      formDataToSend.append('timeline', timelineId)
      
      // Append media files
      mediaFiles.forEach(file => {
        formDataToSend.append('media', file)
      })

      const event = await createEvent(formDataToSend)
      if (event) {
        navigate(`/timeline/${timelineId}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Create New Event</h2>
        
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered h-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">Date</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input input-bordered"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select select-bordered"
              >
                <option value="achievement">Achievement</option>
                <option value="birthday">Birthday</option>
                <option value="career">Career</option>
                <option value="personal">Personal</option>
                <option value="relationship">Relationship</option>
                <option value="travel">Travel</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">Visibility</label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="select select-bordered"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="followers">Followers Only</option>
              </select>
            </div>
          </div>

          {/* Media Upload */}
          <div className="form-control">
            <label className="label">Media</label>
            <div className="flex flex-wrap gap-4">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-base-200">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                  multiple
                />
                <FaImage className="w-6 h-6 mb-2" />
                <span className="text-sm">Add Media</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  )
}

EventForm.propTypes = {
  timelineId: PropTypes.string.isRequired
}

export default EventForm 