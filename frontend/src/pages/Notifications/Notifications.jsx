import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'

import {
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineShieldExclamation,
  HiOutlineBellSlash,
  HiOutlineDocumentText,
} from 'react-icons/hi2'

import {
  getNotifications,
  markNotificationAsRead,
} from '../../services/notificationService'
import { PageSkeleton } from '../../components/ui/Skeleton'

const getNotificationIcon = (title = '') => {
  const text = title.toLowerCase()

  if (text.includes('risk')) {
    return HiOutlineShieldExclamation
  }

  if (text.includes('forecast')) {
    return HiOutlineArrowTrendingUp
  }

  if (text.includes('report')) {
    return HiOutlineDocumentText
  }

  return HiOutlineBanknotes
}

export default function Notifications() {
  const [notifications, setNotifications] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)

      const data =
        await getNotifications()

      setNotifications(
        Array.isArray(data)
          ? data
          : data.notifications || []
      )
    } catch (err) {
      console.error(
        'Notification loading error:',
        err
      )

      setError(
        err.response?.data?.message ||
          'Unable to load notifications.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id)

      setNotifications(
        notifications.map(
          (notification) =>
            notification._id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification
        )
      )
    } catch (err) {
      console.error(
        'Mark notification error:',
        err
      )
    }
  }

  const formatDate = (date) => {
    if (!date) {
      return ''
    }

    return new Date(date).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )
  }

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[
          {
            label: 'Dashboard',
            href: '/app/dashboard',
          },
          {
            label: 'Notifications',
          },
        ]}
        title="Notifications"
        description="Financial forecasts, risk alerts and report updates relevant to your business."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon={HiOutlineBellSlash}
          title="No notifications"
          description="You're all caught up."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map(
            (notification) => {
              const Icon =
                getNotificationIcon(
                  notification.title
                )

              return (
                <Card
                  key={notification._id}
                  className={`flex items-start gap-4 ${
                    !notification.read
                      ? 'border-primary-500'
                      : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 shrink-0">
                    <Icon size={18} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm">
                        {notification.title}
                      </h3>

                      <Badge
                        tone={
                          notification.read
                            ? 'neutral'
                            : 'medium'
                        }
                      >
                        {notification.read
                          ? 'Read'
                          : 'New'}
                      </Badge>
                    </div>

                    <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between gap-3 mt-3">
                      <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                        {formatDate(
                          notification.createdAt
                        )}
                      </p>

                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleMarkAsRead(
                              notification._id
                            )
                          }
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}