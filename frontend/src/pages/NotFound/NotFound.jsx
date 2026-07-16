import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-surface dark:bg-surface-dark">
      <p className="text-6xl font-extrabold text-primary-500">404</p>
      <h1 className="text-xl font-bold mt-3">Page not found</h1>
      <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1 max-w-sm">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/"><Button className="mt-6">Back to Home</Button></Link>
    </div>
  )
}
