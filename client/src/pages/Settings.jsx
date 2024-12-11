import { useState } from 'react'
import useAuthStore from '../stores/authStore'
import ChangePasswordForm from '../components/ChangePasswordForm'
import DeleteAccountForm from '../components/DeleteAccountForm'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const Settings = () => {
  const { user, updateUserSettings } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [profileSettings, setProfileSettings] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
    displayName: user?.displayName || ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newFollower: true,
    newComment: true,
    newLike: true,
    newMessage: true,
    timelineUpdates: true
  })

  const [privacySettings, setPrivacySettings] = useState({
    defaultVisibility: 'public',
    allowTagging: true,
    showOnlineStatus: true,
    allowMessaging: 'everyone', // everyone, followers, none
    showTimelines: true
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Handle profile picture upload first if there's a file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput.files[0]) {
        const formData = new FormData();
        formData.append('profilePicture', fileInput.files[0]);
        
        await axios.put('/api/users/profile/picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Update other profile information
      await updateUserSettings('profile', {
        username: profileSettings.username,
        displayName: profileSettings.displayName,
        email: profileSettings.email,
        bio: profileSettings.bio
      });

      toast.success('Profile settings updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile settings');
      toast.error('Failed to update profile settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await updateUserSettings('notifications', notificationSettings)
      toast.success('Notification settings updated successfully')
    } catch (err) {
      setError(err.message)
      toast.error('Failed to update notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrivacyUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await updateUserSettings('privacy', privacySettings)
      toast.success('Privacy settings updated successfully')
    } catch (err) {
      setError(err.message)
      toast.error('Failed to update privacy settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        e.target.value = '';
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPEG, PNG and WebP files are allowed');
        e.target.value = '';
        return;
      }
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileSettings(prev => ({
          ...prev,
          profilePicture: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProfileSettings = () => (
    <form onSubmit={handleProfileUpdate} className="space-y-4">
      <div className="form-control">
        <label className="label">Profile Picture</label>
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-20 rounded-full">
              <img 
                src={profileSettings.profilePicture || "https://via.placeholder.com/80"} 
                alt="Profile" 
              />
            </div>
          </div>
          <input 
            type="file" 
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="file-input file-input-bordered w-full max-w-xs" 
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">Username</label>
        <input 
          type="text" 
          value={profileSettings.username}
          onChange={(e) => setProfileSettings({...profileSettings, username: e.target.value})}
          className="input input-bordered"
        />
      </div>

      <div className="form-control">
        <label className="label">Display Name</label>
        <input 
          type="text"
          value={profileSettings.displayName}
          onChange={(e) => setProfileSettings({...profileSettings, displayName: e.target.value})}
          className="input input-bordered"
        />
      </div>

      <div className="form-control">
        <label className="label">Bio</label>
        <textarea 
          value={profileSettings.bio}
          onChange={(e) => setProfileSettings({...profileSettings, bio: e.target.value})}
          className="textarea textarea-bordered h-24"
        />
      </div>

      <button type="submit" className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}>
        Save Profile Changes
      </button>
    </form>
  )

  const renderNotificationSettings = () => (
    <form onSubmit={handleNotificationUpdate} className="space-y-4">
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Email Notifications</span>
          <input 
            type="checkbox"
            checked={notificationSettings.emailNotifications}
            onChange={(e) => setNotificationSettings({
              ...notificationSettings, 
              emailNotifications: e.target.checked
            })}
            className="toggle"
          />
        </label>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Push Notifications</span>
          <input 
            type="checkbox"
            checked={notificationSettings.pushNotifications}
            onChange={(e) => setNotificationSettings({
              ...notificationSettings, 
              pushNotifications: e.target.checked
            })}
            className="toggle"
          />
        </label>
      </div>

      <div className="divider">Notify me about</div>

      <div className="space-y-2">
        {Object.entries({
          newFollower: 'New Followers',
          newComment: 'New Comments',
          newLike: 'New Likes',
          newMessage: 'New Messages',
          timelineUpdates: 'Timeline Updates'
        }).map(([key, label]) => (
          <div key={key} className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">{label}</span>
              <input 
                type="checkbox"
                checked={notificationSettings[key]}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  [key]: e.target.checked
                })}
                className="toggle"
              />
            </label>
          </div>
        ))}
      </div>

      <button type="submit" className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}>
        Save Notification Settings
      </button>
    </form>
  )

  const renderPrivacySettings = () => (
    <form onSubmit={handlePrivacyUpdate} className="space-y-4">
      <div className="form-control">
        <label className="label">Default Timeline Visibility</label>
        <select 
          value={privacySettings.defaultVisibility}
          onChange={(e) => setPrivacySettings({
            ...privacySettings,
            defaultVisibility: e.target.value
          })}
          className="select select-bordered w-full"
        >
          <option value="public">Public</option>
          <option value="followers">Followers Only</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label">Who can message me?</label>
        <select 
          value={privacySettings.allowMessaging}
          onChange={(e) => setPrivacySettings({
            ...privacySettings,
            allowMessaging: e.target.value
          })}
          className="select select-bordered w-full"
        >
          <option value="everyone">Everyone</option>
          <option value="followers">Followers Only</option>
          <option value="none">No One</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Allow Others to Tag Me</span>
          <input 
            type="checkbox"
            checked={privacySettings.allowTagging}
            onChange={(e) => setPrivacySettings({
              ...privacySettings,
              allowTagging: e.target.checked
            })}
            className="toggle"
          />
        </label>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Show Online Status</span>
          <input 
            type="checkbox"
            checked={privacySettings.showOnlineStatus}
            onChange={(e) => setPrivacySettings({
              ...privacySettings,
              showOnlineStatus: e.target.checked
            })}
            className="toggle"
          />
        </label>
      </div>

      <button type="submit" className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}>
        Save Privacy Settings
      </button>
    </form>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <ChangePasswordForm />
      </div>
      
      <div className="divider"></div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-error">Danger Zone</h3>
        <DeleteAccountForm />
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Horizontal Menu */}
      <div className="tabs tabs-boxed mb-6">
        <button 
          className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab ${activeTab === 'notifications' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button 
          className={`tab ${activeTab === 'privacy' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          Privacy
        </button>
        <button 
          className={`tab ${activeTab === 'security' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      <div className="flex-1">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
              {activeTab === 'profile' && renderProfileSettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'privacy' && renderPrivacySettings()}
              {activeTab === 'security' && renderSecuritySettings()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings 