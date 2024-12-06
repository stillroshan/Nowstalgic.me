import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTimelineStore from '../stores/timelineStore'

const Create = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public'
  })
  
  const { createTimeline, isLoading, error } = useTimelineStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const timeline = await createTimeline(formData)
    if (timeline) {
      navigate(`/timeline/${timeline._id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Timeline</h2>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter timeline title" 
                className="input input-bordered w-full" 
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="textarea textarea-bordered h-24" 
                placeholder="Enter timeline description"
              ></textarea>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Visibility</span>
              </label>
              <select 
                value={formData.visibility}
                onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                className="select select-bordered w-full"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="followers">Followers Only</option>
              </select>
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              Create Timeline
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Create 