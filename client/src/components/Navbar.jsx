import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import NotificationDropdown from './NotificationDropdown'
import useAuthStore from '../stores/authStore'

const Navbar = () => {
  const { user, logout } = useAuthStore()

  return (
    <div className="navbar bg-base-100 border-b">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">Nowstalgic.me</Link>
        <SearchBar />
      </div>
      <div className="flex-none gap-2">
        <NotificationDropdown />
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img 
                src={user?.profilePicture || '/default-avatar.png'} 
                alt={user?.username} 
              />
            </div>
          </label>
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
      </div>
    </div>
  )
}

export default Navbar
