import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import {
  getProfile,
  updateProfile,
} from '../../services/userService'
import { PageSkeleton } from '../../components/ui/Skeleton'

const inputCls =
  'mt-1 w-full border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none focus:border-primary-500'

export default function Profile() {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    village: '',
    district: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getProfile()

        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          village: data.village || '',
          district: data.district || '',
        })
      } catch (err) {
        console.error(
          'Profile loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load profile.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const updatedUser =
        await updateProfile(formData)

      setFormData({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        village: updatedUser.village || '',
        district: updatedUser.district || '',
      })

      setSuccess(
        'Profile updated successfully.'
      )
    } catch (err) {
      console.error(
        'Profile update error:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Unable to update profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageSkeleton />
  }

  const displayName =
    formData.name ||
    user?.name ||
    'User'

  return (
    <div>
      <PageHeader
        breadcrumb={[
          {
            label: 'Dashboard',
            href:
              user?.role === 'officer'
                ? '/officer/dashboard'
                : '/app/dashboard',
          },
          {
            label: 'Profile',
          },
        ]}
        title="Profile"
        description="Manage your personal and account information."
      />

      <Card className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold">
            {displayName[0]?.toUpperCase()}
          </div>

          <div>
            <p className="font-semibold">
              {displayName}
            </p>

            <p className="text-sm text-ink-dim dark:text-ink-dark-dim capitalize">
              {user?.role || 'User'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
            <p className="text-sm text-green-600 dark:text-green-400">
              {success}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm font-medium">
              Full Name

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </label>

            <label className="text-sm font-medium">
              Email

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputCls}
                required
              />
            </label>

            <label className="text-sm font-medium">
              Phone

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputCls}
                placeholder="+91 98765 43210"
              />
            </label>

            <label className="text-sm font-medium">
              Village

              <input
                name="village"
                value={formData.village}
                onChange={handleChange}
                className={inputCls}
                placeholder="Rampur"
              />
            </label>

            <label className="text-sm font-medium">
              District

              <input
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={inputCls}
                placeholder="Sehore"
              />
            </label>
          </div>

          <Button
            type="submit"
            className="mt-6"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  )
}