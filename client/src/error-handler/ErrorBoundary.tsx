import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    return { hasError: true }
  }

  async componentDidCatch(error: unknown, info: React.ErrorInfo) {
    try {
      const mod = await import('@sentry/electron/renderer')
      // capture with component stack
      ;(mod as any).captureException?.(error, { extra: { componentStack: info.componentStack } })
    } catch {
      // no-op if Sentry not available
    }
    // Always log to console for local debugging
    console.error('Unhandled UI error:', error, info?.componentStack)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center p-6">
          <div className="max-w-lg text-center text-gray-700">
            <h1 className="text-xl font-semibold mb-2">Beklenmeyen bir hata oluştu</h1>
            <p className="mb-4">Sayfayı yenilemeyi deneyin veya işlemi tekrar başlatın.</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={() => window.location.reload()}>
              Yenile
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

