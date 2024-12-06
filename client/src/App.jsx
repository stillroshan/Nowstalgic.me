import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import Layout from './components/Layout'
import AppRoutes from './routes/AppRoutes'
import useAuthStore from './stores/authStore'

const queryClient = new QueryClient()

function App() {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Layout>
            <AppRoutes />
          </Layout>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
