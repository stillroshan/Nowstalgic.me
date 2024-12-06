import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BiBell } from 'react-icons/bi'
import useNotificationStore from '../stores/notificationStore'

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
};

const getNotificationLink = (notification) => {
  switch (notification.type) {
    case 'follow':
      return `/timeline/${notification.timeline}`
    case 'message':
      return `/messages/${notification.sender._id}`
    case 'comment':
      return `/timeline/${notification.timeline}#event-${notification.event}`
    default:
      return '/'
  }
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    notifications, 
    unreadCount,
    fetchNotifications, 
    markAsRead,
    markAllAsRead,
    initializeSocket 
  } = useNotificationStore()

  useEffect(() => {
    initializeSocket()
    fetchNotifications()
  }, [fetchNotifications, initializeSocket])

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id)
    }
    setIsOpen(false)
  }

  return (
    <div className="dropdown dropdown-end">
      <button 
        className="btn btn-ghost btn-circle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="indicator">
          <BiBell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="badge badge-sm indicator-item badge-primary">
              {unreadCount}
            </span>
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-80 max-h-96 overflow-auto">
          <div className="flex justify-between items-center p-2 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="btn btn-ghost btn-xs"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <Link
                key={notification._id}
                to={getNotificationLink(notification)}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 hover:bg-base-200 flex gap-3 items-start ${
                  !notification.read ? 'bg-base-200' : ''
                }`}
              >
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    <img 
                      src={notification.sender?.profilePicture || '/default-avatar.png'} 
                      alt={notification.sender?.username} 
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <span className="text-xs text-base-content/70">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-base-content/70">
              No notifications
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown 