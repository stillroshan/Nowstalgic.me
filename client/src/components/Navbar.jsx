import { Link } from 'react-router-dom'
import { FaBars } from 'react-icons/fa'
import PropTypes from 'prop-types'
import useAuthStore from '../stores/authStore'

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuthStore()

  return (
    <div className="navbar bg-base-100 border-b border-base-300">
      <div className="flex-1">
        <button className="btn btn-ghost" onClick={onMenuClick}>
          <FaBars className="h-5 w-5" />
        </button>
        <Link to="/" className="btn btn-ghost text-xl">
          Nowstalgic
        </Link>
      </div>
      <div className="flex-none gap-2">
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img 
                  src={user?.profilePicture || "https://via.placeholder.com/40"} 
                  alt="profile" 
                />
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

Navbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired
}

export default Navbar
