import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import ThemeToggle from '../../components/ui/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

const inputCls =
  'mt-1 w-full border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none focus:border-primary-500'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    businessType: 'Dairy Farming',
    district: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        'Passwords do not match.'
      )
      return
    }

    try {
      setLoading(true)
      setError('')

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'entrepreneur',
      })

      navigate(
        '/app/dashboard',
        {
          replace: true,
        }
      )
    } catch (err) {
      console.error(
        'Registration error:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Unable to create account.'
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

      <div className="flex items-center justify-center p-6 order-2 lg:order-1">
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
          className="w-full max-w-md space-y-4"
        >
          <div>
            <h1 className="text-2xl font-bold">
              Create your account
            </h1>

            <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1">
              Join Agrow AI today
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              Full Name

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputCls}
                placeholder="Ramesh Kumar"
                required
              />
            </label>

            <label className="text-sm font-medium">
              Business Name

              <input
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className={inputCls}
                placeholder="Shree Ram Dairy Farm"
                required
              />
            </label>
          </div>

          <label className="text-sm font-medium block">
            Business Type

            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className={inputCls}
            >
              <option>Dairy Farming</option>
              <option>Crop Farming</option>
              <option>Poultry</option>
              <option>Handicrafts</option>
              <option>Rural Retail</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              District

              <input
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={inputCls}
                placeholder="Sehore"
                required
              />
            </label>

            <label className="text-sm font-medium">
              Phone Number

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputCls}
                placeholder="+91 98765 43210"
                required
              />
            </label>
          </div>

          <label className="text-sm font-medium block">
            Email

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputCls}
              placeholder="you@example.com"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">
              Password

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputCls}
                required
                minLength={6}
              />
            </label>

            <label className="text-sm font-medium">
              Confirm Password

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputCls}
                required
                minLength={6}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              required
              className="rounded"
            />
            I agree to the Terms & Conditions
          </label>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? 'Creating Account...'
              : 'Register'}
          </Button>

          <p className="text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Already have an account?{' '}

            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-300 font-semibold"
            >
              Login
            </Link>
          </p>
        </motion.form>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 order-1 lg:order-2 p-12">
        <div className="max-w-sm text-center">
          <div className="w-full h-56 rounded-2xl bg-primary-100 dark:bg-primary-900/40 mb-6 flex items-center justify-center text-primary-500 text-sm font-medium">
            Enterprise registration illustration
          </div>

          <h3 className="font-bold text-lg">
            Register your enterprise in minutes
          </h3>

          <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-2">
            Get a financial digital twin that
            grows smarter with every
            transaction you record.
          </p>
        </div>
      </div>
    </div>
  )
}