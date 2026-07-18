import api from './api'

export const getOfficerDashboard = async () => {
  const response = await api.get('/officer/dashboard')
  return response.data
}

export const getEnterpriseRegistry = async () => {
  const response = await api.get('/officer/enterprises')
  return response.data
}

export const getEnterpriseById = async (id) => {
  const response = await api.get(`/officer/enterprises/${id}`)
  return response.data
}

export const getEnterpriseFinancials = async (id) => {
  const response = await api.get(
    `/officer/enterprises/${id}/financials`
  )
  return response.data
}

export const getEnterpriseRisk = async (id) => {
  const response = await api.get(
    `/officer/enterprises/${id}/risk`
  )
  return response.data
}

export const getEnterpriseHealth = async (id) => {
  const response = await api.get(
    `/officer/enterprises/${id}/health`
  )
  return response.data
}

export const getEnterpriseForecast = async (id) => {
  const response = await api.get(
    `/officer/enterprises/${id}/forecast`
  )
  return response.data
}

export const getDistrictAnalytics = async () => {
  const response = await api.get(
    '/officer/district-analytics'
  )
  return response.data
}

export const getVillageAnalytics = async () => {
  const response = await api.get(
    '/officer/village-analytics'
  )
  return response.data
}

export const getSectorDistribution = async () => {
  const response = await api.get(
    '/officer/sector-distribution'
  )
  return response.data
}

export const getRiskMonitoring = async () => {
  const response = await api.get(
    '/officer/risk-monitoring'
  )
  return response.data
}

export const getRiskHeatmap = async () => {
  const response = await api.get(
    '/officer/risk-heatmap'
  )
  return response.data
}
export const getOfficerAlerts = async () => {
  const response = await api.get('/officer/alerts')
  return response.data
}

export const getPortfolioRiskReport = async () => {
  const response = await api.get(
    '/officer/reports/portfolio-risk',
    {
      responseType: 'blob',
    }
  )

  return response.data
}

export const getVillagePerformanceReport = async () => {
  const response = await api.get(
    '/officer/reports/village-performance',
    {
      responseType: 'blob',
    }
  )

  return response.data
}

export const getDefaultPredictionReport = async () => {
  const response = await api.get(
    '/officer/reports/default-prediction',
    {
      responseType: 'blob',
    }
  )

  return response.data
}
export const getAIInsights = async () => {
  const response = await api.get('/officer/ai-insights')
  return response.data
}

export const generateAIInsights = async () => {
  const response = await api.post('/officer/ai-insights/generate')
  return response.data
}