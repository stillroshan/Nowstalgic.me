import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTimelineStore from '../stores/timelineStore'
import { FaPlus } from 'react-icons/fa'

const Create = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
    tags: []
  })
  
  const { createTimeline, isLoading, error } = useTimelineStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const timeline = await createTimeline(formData)
    if (timeline) {
      navigate(`/timeline/${timeline._id}/create-event`)
    }
  }

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      const newTag = e.target.value.trim()
      if (!formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        })
      }
      e.target.value = ''
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Create Your Timeline</h2>
        <p className="text-base-content/70">Start documenting your journey by creating a timeline.</p>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Timeline Title</span>
              </label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., My College Journey, Career Milestones" 
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
                placeholder="What's this timeline about?"
              ></textarea>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Tags</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="badge badge-primary gap-2"
                  >
                    {tag}
                    <button 
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="btn btn-ghost btn-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input 
                type="text"
                placeholder="Add tags (press Enter)"
                onKeyDown={handleTagInput}
                className="input input-bordered w-full"
              />
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
                <option value="public">Public - Anyone can view</option>
                <option value="followers">Followers Only - Only your followers can view</option>
                <option value="private">Private - Only you can view</option>
              </select>
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              <FaPlus className="mr-2" />
              Create Timeline & Add First Event
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Create 