import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineArrowRight, HiOutlineChartBar, HiOutlineShieldCheck, HiOutlineGift } from 'react-icons/hi2'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const stats = [
  { value: '12.4k+', label: 'Enterprises Onboarded' },
  { value: '850+', label: 'Villages Covered' },
  { value: '98.6%', label: 'Prediction Accuracy' },
  { value: '₹2,450 Cr+', label: 'Loans Facilitated' },
]

const features = [
  { icon: HiOutlineChartBar, title: 'Cash Flow Forecasting', desc: 'See 3–6 months ahead with confidence bands built from income, weather and market data.' },
  { icon: HiOutlineShieldCheck, title: 'Sector-Aware Risk Scoring', desc: 'Dairy, crop and retail businesses get risk models built for how each one actually works.' },
  { icon: HiOutlineGift, title: 'Scheme Matching', desc: 'Automatically matched to PMEGP, Mudra, PM-KISAN and other schemes you qualify for.' },
]

export default function Landing() {
  return (
    <div className="bg-surface dark:bg-surface-dark min-h-screen">
      <nav className="flex items-center justify-between px-6 lg:px-12 h-16 border-b border-border dark:border-border-dark">
        <span className="font-bold text-lg">Agrow AI</span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-dim dark:text-ink-dark-dim">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-ink-dim dark:text-ink-dark-dim">Login</Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      <section className="px-6 lg:px-12 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block text-xs font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-300 px-3 py-1 rounded-full mb-4">
            Built for the NABARD Hackathon 2026
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Empowering Rural Enterprises with AI-Driven Financial Intelligence
          </h1>
          <p className="text-ink-dim dark:text-ink-dark-dim mt-5 max-w-lg">
            Agrow AI forecasts cash flow, assesses risk early, and connects rural entrepreneurs to the right support — before problems become crises.
          </p>
          <div className="flex items-center gap-3 mt-8">
            <Link to="/register"><Button icon={HiOutlineArrowRight} className="[&>svg]:order-2">Get Started</Button></Link>
            <a href="#how-it-works"><Button variant="outline">Learn More</Button></a>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 h-72 lg:h-96 flex items-center justify-center text-white/80 text-sm font-medium"
        >
          Rural enterprise + AI dashboard illustration
        </motion.div>
      </section>

      <section className="px-6 lg:px-12 py-10 border-y border-border dark:border-border-dark bg-primary-50/50 dark:bg-primary-900/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl lg:text-3xl font-extrabold text-primary-700 dark:text-primary-300">{s.value}</p>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="px-6 lg:px-12 py-20 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">Everything you need, in one platform</h2>
        <p className="text-center text-ink-dim dark:text-ink-dark-dim mb-12">From daily transactions to district-level policy decisions.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title}>
              <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-ink-dim dark:text-ink-dark-dim">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 lg:px-12 py-16 bg-primary-700 text-white text-center">
        <h2 className="text-2xl lg:text-3xl font-bold mb-3">Ready to see your business clearly?</h2>
        <p className="text-white/70 mb-6">Join thousands of rural entrepreneurs already using Agrow AI.</p>
        <Link to="/register"><Button className="!bg-white !text-primary-700">Create your account</Button></Link>
      </section>

      <footer className="px-6 lg:px-12 py-8 text-center text-xs text-ink-dim dark:text-ink-dark-dim">
        © 2026 Agrow AI · Built for NABARD Hackathon @ Global FinTech Fest
      </footer>
    </div>
  )
}
