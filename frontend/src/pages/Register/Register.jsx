import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import ThemeToggle from '../../components/ui/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

const inputCls = "mt-1 w-full border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none focus:border-primary-500"

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    login({ role: 'entrepreneur' })
    navigate('/app/dashboard')
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface dark:bg-surface-dark relative">
      <div className="absolute top-4 right-4 z-10"><ThemeToggle /></div>
      <div className="flex items-center justify-center p-6 order-2 lg:order-1">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4"
        >
          <div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1">Join Agrow AI today</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">Full Name
              <input className={inputCls} placeholder="Ramesh Kumar" />
            </label>
            <label className="text-sm font-medium">Business Name
              <input className={inputCls} placeholder="Shree Ram Dairy Farm" />
            </label>
          </div>

          <label className="text-sm font-medium block">Business Type
            <select className={inputCls}>
              <option>Dairy Farming</option>
              <option>Crop Farming</option>
              <option>Poultry</option>
              <option>Handicrafts</option>
              <option>Rural Retail</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">District
              <input className={inputCls} placeholder="Sehore" />
            </label>
            <label className="text-sm font-medium">Phone Number
              <input className={inputCls} placeholder="+91 98765 43210" />
            </label>
          </div>

          <label className="text-sm font-medium block">Email
            <input type="email" className={inputCls} placeholder="you@example.com" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">Password
              <input type="password" className={inputCls} />
            </label>
            <label className="text-sm font-medium">Confirm Password
              <input type="password" className={inputCls} />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" required className="rounded" /> I agree to the Terms & Conditions
          </label>

          <Button type="submit" className="w-full">Register</Button>

          <p className="text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-300 font-semibold">Login</Link>
          </p>
        </motion.form>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 order-1 lg:order-2 p-12">
        <div className="max-w-sm text-center">
          <div className="w-full h-56 rounded-2xl bg-primary-100 dark:bg-primary-900/40 mb-6 flex items-center justify-center text-primary-500 text-sm font-medium">
            Enterprise registration illustration
          </div>
          <h3 className="font-bold text-lg">Register your enterprise in minutes</h3>
          <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-2">
            Get a financial digital twin that grows smarter with every transaction you record.
          </p>
        </div>
      </div>
    </div>
  )
}
