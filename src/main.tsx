import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import { AppProviders } from '@/app/AppProviders'
import '@/styles/index.css'

// Keep React bootstrapping thin: global styles and app-level providers are
// wired here, while routing and feature composition stay inside App.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)
