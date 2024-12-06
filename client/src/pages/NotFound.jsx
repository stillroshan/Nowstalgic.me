import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="hero min-h-[80vh]">
      <div className="hero-content text-center">
        <div>
          <h1 className="text-5xl font-bold">404</h1>
          <p className="py-6">Sorry, the page you are looking for does not exist.</p>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound 