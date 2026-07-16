import {
  HiOutlineSquares2X2, HiOutlineBuildingStorefront, HiOutlineBanknotes,
  HiOutlineChartBar, HiOutlineShieldExclamation, HiOutlineHeart,
  HiOutlineGift, HiOutlineDocumentText, HiOutlineBell, HiOutlineUserCircle,
  HiOutlineCog6Tooth, HiOutlineClipboardDocumentList, HiOutlineMapPin,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'

export const entrepreneurNav = [
  { label: 'Dashboard', to: '/app/dashboard', icon: HiOutlineSquares2X2 },
  { label: 'My Enterprise', to: '/app/my-enterprise', icon: HiOutlineBuildingStorefront },
  { label: 'Financial Records', to: '/app/financial-records', icon: HiOutlineBanknotes },
  { label: 'Forecast Studio', to: '/app/forecast-studio', icon: HiOutlineChartBar },
  { label: 'Risk Intelligence', to: '/app/risk-intelligence', icon: HiOutlineShieldExclamation },
  { label: 'Enterprise Health', to: '/app/enterprise-health', icon: HiOutlineHeart },
  { label: 'Scheme Advisor', to: '/app/scheme-advisor', icon: HiOutlineGift },
  { label: 'Reports', to: '/app/reports', icon: HiOutlineDocumentText },
  { label: 'Notifications', to: '/app/notifications', icon: HiOutlineBell },
  { label: 'Profile', to: '/app/profile', icon: HiOutlineUserCircle },
  { label: 'Settings', to: '/app/settings', icon: HiOutlineCog6Tooth },
]

export const officerNav = [
  { label: 'Dashboard', to: '/officer/dashboard', icon: HiOutlineSquares2X2 },
  { label: 'Enterprise Registry', to: '/officer/enterprise-registry', icon: HiOutlineClipboardDocumentList },
  { label: 'Village Analytics', to: '/officer/village-analytics', icon: HiOutlineMapPin },
  { label: 'Risk Monitoring', to: '/officer/risk-monitoring', icon: HiOutlineExclamationTriangle },
  { label: 'Reports', to: '/officer/reports', icon: HiOutlineDocumentText },
  { label: 'Alerts', to: '/officer/alerts', icon: HiOutlineBell },
  { label: 'Profile', to: '/officer/profile', icon: HiOutlineUserCircle },
  { label: 'Settings', to: '/officer/settings', icon: HiOutlineCog6Tooth },
]
