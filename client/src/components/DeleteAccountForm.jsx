import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

const DeleteAccountForm = () => {
  const [password, setPassword] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const { deleteAccount, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleDelete = async (e) => {
    e.preventDefault()
    const success = await deleteAccount(password)
    if (success) {
      navigate('/login')
    }
  }

  if (!showConfirm) {
    return (
      <button 
        onClick={() => setShowConfirm(true)}
        className="btn btn-error w-full"
      >
        Delete Account
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="alert alert-warning">
        <span>This action cannot be undone. All your data will be permanently deleted.</span>
      </div>

      <form onSubmit={handleDelete} className="space-y-4">
        <div className="form-control">
          <label className="label">Confirm your password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered"
            required
          />
        </div>

        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setShowConfirm(false)}
            className="btn btn-ghost flex-1"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className={`btn btn-error flex-1 ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            Confirm Delete
          </button>
        </div>
      </form>
    </div>
  )
}

export default DeleteAccountForm 