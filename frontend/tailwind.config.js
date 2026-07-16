/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          50: '#EAF6EB',
          100: '#CFEBD2',
          200: '#A3D8A9',
          300: '#75C47D',
          400: '#4CAF50',
          500: '#2E7D32',
          600: '#276B2A',
          700: '#1F5722',
          800: '#17431A',
          900: '#0F2E12',
        },
        secondary: '#4CAF50',
        accent: '#FFC107',
        info: '#2563EB',
        surface: {
          DEFAULT: '#F8FAFC',
          dark: '#0B1220',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#121A2B',
        },
        border: {
          DEFAULT: '#E6EBF0',
          dark: '#22304A',
        },
        ink: {
          DEFAULT: '#0F172A',
          dim: '#5B6B82',
          dark: '#E7ECF3',
          'dark-dim': '#8CA0BE',
        },
        risk: {
          low: '#2E7D32',
          medium: '#FFC107',
          high: '#EF6C1C',
          critical: '#D92D20',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)',
        'soft-dark': '0 1px 2px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
