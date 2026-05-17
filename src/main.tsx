// main.tsx is the browser entrypoint. It mounts the React tree, wires global
// providers, and loads the shared stylesheet bundle before any page renders.
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import { AppProviders } from '@/app/AppProviders'
import '@/styles/index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)
