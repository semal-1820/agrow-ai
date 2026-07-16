import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

const inputCls = "mt-1 w-full border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none focus:border-primary-500"

export default function Profile() {
  const { user } = useAuth()
  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Dashboard', href: user?.role === 'officer' ? '/officer/dashboard' : '/app/dashboard' }, { label: 'Profile' }]}
        title="Profile"
        description="Manage your personal and account information."
      />
      <Card className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim capitalize">{user?.role}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium">Full Name<input defaultValue={user?.name} className={inputCls} /></label>
          <label className="text-sm font-medium">Email<input defaultValue={user?.email || 'demo@agrowai.in'} className={inputCls} /></label>
          <label className="text-sm font-medium">Phone<input defaultValue="+91 98765 43210" className={inputCls} /></label>
          <label className="text-sm font-medium">Village / District<input defaultValue="Rampur, Sehore" className={inputCls} /></label>
        </div>
        <Button className="mt-6">Save Changes</Button>
      </Card>
    </div>
  )
}
