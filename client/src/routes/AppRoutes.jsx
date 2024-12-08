import { Routes, Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import Login from '../pages/Login'
import Register from '../pages/Register'
import AuthCallback from '../pages/AuthCallback'
import Profile from '../pages/Profile'
import Home from '../pages/Home'
import Create from '../pages/Create'
import CreateEvent from '../pages/CreateEvent'
import Timeline from '../pages/Timeline'
import Messages from '../pages/Messages'
import NotFound from '../pages/NotFound'


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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

      <Route path="/auth/success" element={<AuthCallback />} />

      <Route path="/messages" element={
        <PrivateRoute>
          <Messages />
        </PrivateRoute>
      } />

      <Route path="/messages/:userId" element={
        <PrivateRoute>
          <Messages />
        </PrivateRoute>
      } />

      <Route 
        path="/create" 
        element={
          <PrivateRoute>
            <Create />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/timeline/:timelineId" 
        element={
          <PrivateRoute>
            <Timeline />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/timeline/:timelineId/create-event" 
        element={
          <PrivateRoute>
            <CreateEvent />
          </PrivateRoute>
        } 
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
