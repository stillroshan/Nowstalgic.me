import { Link, useLocation } from 'react-router-dom'
import { 
  FaHome, 
  FaCompass, 
  FaPlus, 
  FaBell, 
  FaUser,
  FaSearch,
  FaEnvelope
} from 'react-icons/fa'

const Sidebar = () => {
  const location = useLocation()
  
  const menuItems = [
    { path: '/', icon: FaHome, label: 'Home' },
    { path: '/explore', icon: FaCompass, label: 'Explore' },
    { path: '/search', icon: FaSearch, label: 'Search' },
    { path: '/create', icon: FaPlus, label: 'Create' },
    { path: '/messages', icon: FaEnvelope, label: 'Messages' },
    { path: '/notifications', icon: FaBell, label: 'Notifications' },
    { path: '/profile', icon: FaUser, label: 'Profile' },
  ]

  return (
    <div className="h-full bg-base-100 border-r border-base-300">
      {/* Logo */}
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="text-2xl font-bold">
          Nowstalgic
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-3 p-3 rounded-lg transition-colors
              hover:bg-base-200
              ${location.pathname === item.path ? 'bg-base-200 font-medium' : ''}
            `}
          >
            <item.icon className="w-6 h-6" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar 