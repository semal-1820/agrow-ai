import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function ResetPassword() {
  const [done, setDone] = useState(false)
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark px-6">
      <form onSubmit={(e) => { e.preventDefault(); setDone(true); setTimeout(() => navigate('/login'), 1200) }} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Reset password</h1>
        {done ? (
          <p className="text-sm text-primary-600 dark:text-primary-300 font-medium">Password updated. Redirecting to login…</p>
        ) : (
          <>
            <input type="password" required placeholder="New password"
              className="w-full border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none focus:border-primary-500" />
            <input type="password" required placeholder="Confirm new password"
              className="w-full border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none focus:border-primary-500" />
            <Button type="submit" className="w-full">Reset Password</Button>
          </>
        )}
      </form>
    </div>
  )
}
