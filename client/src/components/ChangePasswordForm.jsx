import { useState } from 'react'
import useAuthStore from '../stores/authStore'

const ChangePasswordForm = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const { updatePassword, isLoading } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwords.newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    const success = await updatePassword(
      passwords.currentPassword,
      passwords.newPassword
    )

    if (success) {
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">Current Password</label>
        <input
          type="password"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
          className="input input-bordered"
          required
        />
      </div>

      <div className="form-control">
        <label className="label">New Password</label>
        <input
          type="password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
          className="input input-bordered"
          required
        />
      </div>

      <div className="form-control">
        <label className="label">Confirm New Password</label>
        <input
          type="password"
          value={passwords.confirmPassword}
          onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
          className="input input-bordered"
          required
        />
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <button 
        type="submit" 
        className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        Update Password
      </button>
    </form>
  )
}

export default ChangePasswordForm 