export async function reportError(error: unknown, context?: Record<string, any>) {
  try {
    const mod = await import('@sentry/electron/renderer')
    ;(mod as any).captureException?.(error, { extra: context })
  } catch {
    // ignore if Sentry not wired
  }
  try {
    console.error('[error-handler]', error, context)
  } catch {}
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

