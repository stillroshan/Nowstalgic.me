import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import NotFound from '../pages/NotFound'
import PrivateRoute from '../components/PrivateRoute'
import AuthCallback from '../pages/AuthCallback'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      } />
      
      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />

      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
