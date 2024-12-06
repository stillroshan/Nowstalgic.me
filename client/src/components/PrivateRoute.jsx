import { Navigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import useAuthStore from '../stores/authStore'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // Save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
}

export default PrivateRoute 