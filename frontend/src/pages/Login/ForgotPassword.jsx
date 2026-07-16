import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark px-6">
      <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-sm text-ink-dim dark:text-ink-dark-dim">Enter your email and we'll send you a reset link.</p>
        {sent ? (
          <p className="text-sm text-primary-600 dark:text-primary-300 font-medium">Reset link sent — check your inbox.</p>
        ) : (
          <>
            <input type="email" required placeholder="you@example.com"
              className="w-full border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none focus:border-primary-500" />
            <Button type="submit" className="w-full">Send Reset Link</Button>
          </>
        )}
        <Link to="/login" className="block text-center text-sm text-primary-600 dark:text-primary-300 font-semibold">Back to Login</Link>
      </form>
    </div>
  )
}
