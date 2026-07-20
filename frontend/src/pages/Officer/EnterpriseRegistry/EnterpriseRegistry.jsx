import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../../components/ui/PageHeader'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import {
  Table,
  Thead,
  Th,
  Tr,
  Td,
} from '../../../components/ui/Table'
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2'

import { getEnterpriseRegistry } from '../../../services/officerService'
import { PageSkeleton } from '../../../components/ui/Skeleton'

const riskTone = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
}

export default function EnterpriseRegistry() {
  const navigate = useNavigate()

  const [enterprises, setEnterprises] = useState([])
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEnterprises = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getEnterpriseRegistry()

        setEnterprises(
          Array.isArray(data)
            ? data
            : data.enterprises || []
        )
      } catch (err) {
        console.error(
          'Enterprise registry loading error:',
          err
        )

        setError(
          err.response?.data?.message ||
            'Unable to load enterprise registry.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadEnterprises()
  }, [])

  const filtered = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase()

    return enterprises.filter((item) => {
      const enterprise =
        item.enterprise || item

      const owner =
        enterprise.owner || {}

      const ownerName =
        typeof owner === 'object'
          ? owner.name || ''
          : ''

      const riskLevel =
        item.level ||
        item.risk ||
        enterprise.riskLevel ||
        'Low'

      const matchesSearch =
        !query ||
        (enterprise.name || '')
          .toLowerCase()
          .includes(query) ||
        ownerName
          .toLowerCase()
          .includes(query) ||
        (enterprise.village || '')
          .toLowerCase()
          .includes(query) ||
        (enterprise.district || '')
          .toLowerCase()
          .includes(query)

      const matchesRisk =
        riskFilter === 'All' ||
        riskLevel === riskFilter

      return (
        matchesSearch &&
        matchesRisk
      )
    })
  }, [
    enterprises,
    search,
    riskFilter,
  ])

  if (loading) {
    return <PageSkeleton />
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[
          {
            label: 'Dashboard',
            href: '/officer/dashboard',
          },
          {
            label: 'Enterprise Registry',
          },
        ]}
        title="Enterprise Registry"
        description="Search and monitor registered enterprises."
      />

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2 bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-xl px-3 py-2.5 flex-1">
          <HiOutlineMagnifyingGlass
            className="text-ink-dim dark:text-ink-dark-dim"
            size={16}
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search enterprises, owners, villages..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <select
          value={riskFilter}
          onChange={(e) =>
            setRiskFilter(
              e.target.value
            )
          }
          className="border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-sm bg-card dark:bg-card-dark"
        >
          <option>All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      <Card padded={false}>
        <Table>
          <Thead>
            <Th>Enterprise ID</Th>
            <Th>Name</Th>
            <Th>Owner</Th>
            <Th>Village</Th>
            <Th>District</Th>
            <Th>Sector</Th>
            <Th>Risk</Th>
          </Thead>

          <tbody>
            {filtered.map((item) => {
              const enterprise =
                item.enterprise || item

              const owner =
                enterprise.owner || {}

              const ownerName =
                typeof owner === 'object'
                  ? owner.name ||
                    owner.email ||
                    'N/A'
                  : 'N/A'

              const riskLevel =
                item.level ||
                item.risk ||
                enterprise.riskLevel ||
                'Low'

              const enterpriseId =
                enterprise._id ||
                item._id

              return (
                <Tr
                  key={enterpriseId}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/officer/enterprise-registry/${enterpriseId}`
                    )
                  }
                >
                  <Td>
                    {enterpriseId
                      ? enterpriseId.slice(
                          -8
                        )
                      : 'N/A'}
                  </Td>

                  <Td className="font-medium">
                    {enterprise.name ||
                      'N/A'}
                  </Td>

                  <Td>
                    {ownerName}
                  </Td>

                  <Td>
                    {enterprise.village ||
                      'N/A'}
                  </Td>

                  <Td>
                    {enterprise.district ||
                      'N/A'}
                  </Td>

                  <Td>
                    {enterprise.type ||
                      'N/A'}
                  </Td>

                  <Td>
                    <Badge
                      tone={
                        riskTone[
                          riskLevel
                        ] || 'neutral'
                      }
                    >
                      {riskLevel}
                    </Badge>
                  </Td>
                </Tr>
              )
            })}
          </tbody>
        </Table>

        {filtered.length === 0 && (
          <p className="text-sm text-center text-ink-dim dark:text-ink-dark-dim py-8">
            No enterprises match your
            filters.
          </p>
        )}
      </Card>
    </div>
  )
}