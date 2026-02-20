import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import './index.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

// Import the actual App component
import App from './App.jsx'

console.log('🚀 Starting Norden Suites...')

const container = document.getElementById('root')
if (!container) {
  console.error('❌ Root element not found!')
  document.body.innerHTML = '<div style="color: red; padding: 50px; font-size: 24px;">CRITICAL ERROR: Root element missing</div>'
} else {
  console.log('✅ Root element found, mounting React...')

  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <MantineProvider defaultColorScheme="dark">
        <Notifications position="top-right" />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MantineProvider>
    </React.StrictMode>
  )

  console.log('✅ React app mounted successfully!')
}
