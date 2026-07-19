import { Component } from 'react'
import ErrorState from './ui/ErrorState'

/**
 * Phase 4 — App-wide error boundary (Module 12).
 * React error boundaries must be class components; there's no hook
 * equivalent. Wraps the whole router in App.jsx so a render-time crash in
 * any single page shows a recoverable error screen instead of a fully
 * blank white app.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // In production this is exactly where you'd forward to a monitoring
    // service (Sentry, LogRocket, etc.) alongside the backend's winston
    // logs — kept as a console.error for now since no such service is
    // wired up yet.
    console.error('Unhandled UI error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <ErrorState
            title="The app hit an unexpected error"
            description="Try going back to the home page. If this keeps happening, please report it."
            onRetry={this.handleReset}
          />
        </div>
      )
    }

    return this.props.children
  }
}
