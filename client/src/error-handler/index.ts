export async function reportError(error: unknown, context?: Record<string, unknown>) {
  try {
    const mod = await import('@sentry/electron/renderer')
    type SentryRenderer = { captureException?: (err: unknown, opts?: { extra?: Record<string, unknown> }) => void }
    const sentry = mod as unknown as SentryRenderer
    const opts = context ? { extra: context } : undefined
    sentry.captureException?.(error, opts)
  } catch {
    // ignore if Sentry not wired
  }
  try {
    console.error('[error-handler]', error, context)
  } catch { /* ignore */ void 0; }
}

export function setupGlobalErrorHandlers() {
  // window.error
  window.addEventListener('error', (event) => {
    reportError(event.error || event.message, { type: 'window.error' })
  })
  // unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, { type: 'unhandledrejection' })
  })
}

