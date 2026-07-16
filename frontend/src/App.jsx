import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import { entrepreneurNav, officerNav } from './constants/nav'

import Landing from './pages/Landing/Landing'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ForgotPassword from './pages/Login/ForgotPassword'
import ResetPassword from './pages/Login/ResetPassword'
import NotFound from './pages/NotFound/NotFound'
import Unauthorized from './pages/NotFound/Unauthorized'

import Dashboard from './pages/Dashboard/Dashboard'
import MyEnterprise from './pages/MyEnterprise/MyEnterprise'
import FinancialRecords from './pages/FinancialRecords/FinancialRecords'
import ForecastStudio from './pages/ForecastStudio/ForecastStudio'
import RiskIntelligence from './pages/RiskIntelligence/RiskIntelligence'
import EnterpriseHealth from './pages/EnterpriseHealth/EnterpriseHealth'
import SchemeAdvisor from './pages/SchemeAdvisor/SchemeAdvisor'
import Reports from './pages/Reports/Reports'
import Notifications from './pages/Notifications/Notifications'
import Profile from './pages/Profile/Profile'
import Settings from './pages/Settings/Settings'

import OfficerDashboard from './pages/Officer/OfficerDashboard'
import EnterpriseRegistry from './pages/Officer/EnterpriseRegistry/EnterpriseRegistry'
import VillageAnalytics from './pages/Officer/VillageAnalytics/VillageAnalytics'
import RiskMonitoring from './pages/Officer/RiskMonitoring/RiskMonitoring'
import OfficerAlerts from './pages/Officer/Alerts/OfficerAlerts'
import OfficerReports from './pages/Officer/Reports/OfficerReports'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
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
              <Route path="village-analytics" element={<VillageAnalytics />} />
              <Route path="risk-monitoring" element={<RiskMonitoring />} />
              <Route path="reports" element={<OfficerReports />} />
              <Route path="alerts" element={<OfficerAlerts />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
