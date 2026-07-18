import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
} from 'react-icons/hi2'

import Button from '../../components/ui/Button'
import ThemeToggle from '../../components/ui/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')

      const user = await login({
        email,
        password,
      })

      if (user.role === 'officer') {
        navigate(
          '/officer/dashboard',
          {
            replace: true,
          }
        )
      } else {
        navigate(
          '/app/dashboard',
          {
            replace: true,
          }
        )
      }
    } catch (err) {
      console.error(
        'Login error:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Unable to login. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface dark:bg-surface-dark relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="hidden lg:flex flex-col justify-between bg-primary-700 text-white p-12">
        <Link
          to="/"
          className="font-bold text-lg"
        >
          Agrow AI
        </Link>

        <div>
          <h2 className="text-3xl font-bold leading-tight mb-3">
            Financial intelligence for every
            rural enterprise.
          </h2>

          <p className="text-white/70 max-w-sm">
            Forecast cash flow, flag risk
            early, and unlock the right
            government scheme — in one
            platform.
          </p>
        </div>

        <p className="text-xs text-white/50">
          © 2026 Agrow AI · Built for NABARD
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <motion.form
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-5"
        >
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back
            </h1>

            <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1">
              Log in to your Agrow AI account
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <label className="block text-sm font-medium">
            Email

            <div className="mt-1 flex items-center gap-2 border border-border dark:border-border-dark rounded-xl px-3 py-2.5 focus-within:border-primary-500">
              <HiOutlineEnvelope
                className="text-ink-dim dark:text-ink-dark-dim"
                size={18}
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="you@example.com"
                className="bg-transparent outline-none w-full text-sm"
                required
              />
            </div>
          </label>

          <label className="block text-sm font-medium">
            Password

            <div className="mt-1 flex items-center gap-2 border border-border dark:border-border-dark rounded-xl px-3 py-2.5 focus-within:border-primary-500">
              <HiOutlineLockClosed
                className="text-ink-dim dark:text-ink-dark-dim"
                size={18}
              />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-sm"
                required
              />
            </div>
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded"
              />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-primary-600 dark:text-primary-300 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? 'Logging in...'
              : 'Log in'}
          </Button>

          <p className="text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Don't have an account?{' '}

            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-300 font-semibold"
            >
              Register
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  )
}