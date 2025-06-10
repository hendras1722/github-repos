import * as React from 'react'

// Error logging function - replace with your actual logging service
const logErrorToMyService = (
  error: Error,
  componentStack: string | null | undefined,
  ownerStack?: string | undefined
) => {
  console.error('Error Boundary caught an error:', {
    error: error.message,
    stack: error.stack,
    componentStack: componentStack || 'No component stack available',
    ownerStack: ownerStack || 'No owner stack available',
    timestamp: new Date().toISOString(),
  })

  // Replace this with your actual error reporting service
  // Examples: Sentry, LogRocket, Bugsnag, etc.
  // Sentry.captureException(error, { contexts: { react: { componentStack } } });
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logErrorToMyService(
      error,
      // Example "componentStack":
      // in ComponentThatThrows (created by App)
      // in ErrorBoundary (created by App)
      // in div (created by App)
      // in App
      info.componentStack,
      // Warning: `captureOwnerStack` is not available in production.
      React.captureOwnerStack?.() ?? undefined
    )
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback
    }

    return this.props.children
  }
}

export default ErrorBoundary
