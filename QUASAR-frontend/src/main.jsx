import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "@/components/theme-provider"
import { CursorProvider } from './contexts/CursorContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="quasar-ui-theme" attribute="data-theme">
      <CursorProvider>
        <App />
      </CursorProvider>
    </ThemeProvider>
  </StrictMode>,
)
