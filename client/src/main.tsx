import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandlers } from './error-handler'
import { ErrorBoundary } from './error-handler/ErrorBoundary'

// Sentry (renderer) – preload üzerinden dsn sağlanırsa dinamik init
(async () => {
  try {
    // @ts-expect-error - window.sentry preload'tan gelir
    const dsn: string | undefined = window.sentry?.dsn;
    if (dsn) {
      const Sentry = await import('@sentry/electron/renderer');
      Sentry.init({ dsn, tracesSampleRate: 0.2 });
      // console.log('Sentry (renderer) initialized');
    }
  } catch (_) {
    // sessizce geç
  }
})();

// Global error handlers (renderer)
setupGlobalErrorHandlers()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
