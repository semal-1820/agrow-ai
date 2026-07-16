import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-surface dark:bg-surface-dark">
      <p className="text-6xl font-extrabold text-accent">401</p>
      <h1 className="text-xl font-bold mt-3">Access restricted</h1>
      <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1 max-w-sm">
        You don't have permission to view this page with your current role.
      </p>
      <Link to="/login"><Button className="mt-6">Back to Login</Button></Link>
    </div>
  )
}
