import { useState } from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import RightSidebar from './RightSidebar'

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()
  
  // Don't show sidebars on login/register pages
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  if (isAuthPage) {
    return children
  }

  return (
    <div className="flex h-screen bg-base-200">
      {/* Left Sidebar - hidden on mobile, visible on desktop */}
      <div className={`hidden md:block w-64 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation - visible on mobile */}
        <div className="md:hidden">
          <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Right Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden lg:block border-l border-base-300">
        <RightSidebar />
      </div>
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
}

export default Layout 