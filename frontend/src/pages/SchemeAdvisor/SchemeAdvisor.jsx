import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { HiOutlineGift } from 'react-icons/hi2'

import { getEnterprises } from '../../services/enterpriseService'
import { getEligibleSchemes } from '../../services/schemeService'

export default function SchemeAdvisor() {
  const [enterprise, setEnterprise] = useState(null)
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSchemes = async () => {
      try {
        setLoading(true)

        const enterprises = await getEnterprises()

        if (!enterprises || enterprises.length === 0) {
          setError(
            'No enterprise found. Create an enterprise first.'
          )
          return
        }

        const selectedEnterprise = enterprises[0]

        setEnterprise(selectedEnterprise)

        const schemeData =
          await getEligibleSchemes(
            selectedEnterprise._id
          )

        setSchemes(
          Array.isArray(schemeData)
            ? schemeData
            : schemeData.schemes || []
        )
      } catch (err) {
        console.error(
          'Scheme loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load government schemes.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadSchemes()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        Finding eligible schemes...
      </div>
    )
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
            label: 'Scheme Advisor',
          },
        ]}
        title="Government Scheme Advisor"
        description="Schemes matched to your business profile, income, location and enterprise type."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      {enterprise && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Matching schemes for
              </p>

              <p className="font-semibold">
                {enterprise.name}
              </p>
            </div>

            <Badge tone="neutral">
              {enterprise.type || 'Enterprise'}
            </Badge>

            {enterprise.state && (
              <Badge tone="neutral">
                {enterprise.state}
              </Badge>
            )}
          </div>
        </Card>
      )}

      {schemes.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {schemes.map((scheme) => {
            const match =
              scheme.matchPercentage ??
              scheme.match ??
              100

            const documents =
              scheme.requiredDocuments ||
              scheme.documents ||
              []

            return (
              <Card
                key={scheme._id || scheme.id}
                className="flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300">
                    <HiOutlineGift size={20} />
                  </div>

                  <Badge tone="low">
                    {match}% Match
                  </Badge>
                </div>

                <h3 className="font-semibold">
                  {scheme.name}
                </h3>

                {scheme.description && (
                  <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1">
                    {scheme.description}
                  </p>
                )}

                <p className="text-sm font-semibold text-primary-600 dark:text-primary-300 mt-3">
                  {scheme.benefits ||
                    scheme.benefit ||
                    'Benefits available'}
                </p>

                {documents.length > 0 && (
                  <>
                    <p className="text-xs font-semibold mt-4 mb-2">
                      Required Documents
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {documents.map(
                        (document, index) => (
                          <Badge
                            key={`${document}-${index}`}
                            tone="neutral"
                          >
                            {document}
                          </Badge>
                        )
                      )}
                    </div>
                  </>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                >
                  View Scheme Details
                </Button>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <HiOutlineGift
              size={32}
              className="mx-auto mb-3 text-ink-dim dark:text-ink-dark-dim"
            />

            <h3 className="font-semibold">
              No Eligible Schemes Found
            </h3>

            <p className="text-sm text-ink-dim dark:text-ink-dark-dim mt-1">
              No government schemes currently
              match this enterprise profile.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}