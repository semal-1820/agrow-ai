import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import ErrorBoundary from './components/ErrorBoundary'
import { PageSkeleton } from './components/ui/Skeleton'
import { entrepreneurNav, officerNav } from './constants/nav'

// These are on the critical path for a first-time visitor (landing/auth),
// so they stay as regular eager imports — no point lazy-loading something
// that's needed immediately and is already small.
import Landing from './pages/Landing/Landing'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ForgotPassword from './pages/Login/ForgotPassword'
import ResetPassword from './pages/Login/ResetPassword'
import NotFound from './pages/NotFound/NotFound'
import Unauthorized from './pages/NotFound/Unauthorized'

// Phase 4 — Module 2 (Performance): everything behind auth is lazy-loaded
// so the initial bundle a visitor downloads is just the landing/login
// flow. Each dashboard page becomes its own chunk, fetched on first visit
// to that route. Route paths below are UNCHANGED from before.
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const MyEnterprise = lazy(() => import('./pages/MyEnterprise/MyEnterprise'))
const FinancialRecords = lazy(() => import('./pages/FinancialRecords/FinancialRecords'))
const ForecastStudio = lazy(() => import('./pages/ForecastStudio/ForecastStudio'))
const RiskIntelligence = lazy(() => import('./pages/RiskIntelligence/RiskIntelligence'))
const EnterpriseHealth = lazy(() => import('./pages/EnterpriseHealth/EnterpriseHealth'))
const SchemeAdvisor = lazy(() => import('./pages/SchemeAdvisor/SchemeAdvisor'))
const Reports = lazy(() => import('./pages/Reports/Reports'))
const Notifications = lazy(() => import('./pages/Notifications/Notifications'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
const Settings = lazy(() => import('./pages/Settings/Settings'))

const OfficerDashboard = lazy(() => import('./pages/Officer/OfficerDashboard'))
const EnterpriseRegistry = lazy(() => import('./pages/Officer/EnterpriseRegistry/EnterpriseRegistry'))
const EnterpriseDetail = lazy(() => import('./pages/Officer/EnterpriseDetail/EnterpriseDetail'))
const VillageAnalytics = lazy(() => import('./pages/Officer/VillageAnalytics/VillageAnalytics'))
const DistrictAnalytics = lazy(() => import('./pages/Officer/DistrictAnalytics/DistrictAnalytics'))
const RiskMonitoring = lazy(() => import('./pages/Officer/RiskMonitoring/RiskMonitoring'))
const OfficerAlerts = lazy(() => import('./pages/Officer/Alerts/OfficerAlerts'))
const OfficerReports = lazy(() => import('./pages/Officer/Reports/OfficerReports'))
const SchemeManagement = lazy(() => import('./pages/Officer/SchemeManagement/SchemeManagement'))
const AIInsights = lazy(() => import('./pages/Officer/AIInsights/AIInsights'))

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Entrepreneur portal */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute role="entrepreneur">
                      <AppLayout nav={entrepreneurNav} />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="my-enterprise" element={<MyEnterprise />} />
                  <Route path="financial-records" element={<FinancialRecords />} />
                  <Route path="forecast-studio" element={<ForecastStudio />} />
                  <Route path="risk-intelligence" element={<RiskIntelligence />} />
                  <Route path="enterprise-health" element={<EnterpriseHealth />} />
                  <Route path="scheme-advisor" element={<SchemeAdvisor />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Officer portal */}
                <Route
                  path="/officer"
                  element={
                    <ProtectedRoute role="officer">
                      <AppLayout nav={officerNav} />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<OfficerDashboard />} />
                  <Route path="enterprise-registry" element={<EnterpriseRegistry />} />
                  <Route path="enterprise-registry/:id" element={<EnterpriseDetail />} />
                  <Route path="village-analytics" element={<VillageAnalytics />} />
                  <Route path="district-analytics" element={<DistrictAnalytics />} />
                  <Route path="scheme-management" element={<SchemeManagement />} />
                  <Route path="ai-insights" element={<AIInsights />} />
                  <Route path="risk-monitoring" element={<RiskMonitoring />} />
                  <Route path="reports" element={<OfficerReports />} />
                  <Route path="alerts" element={<OfficerAlerts />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
