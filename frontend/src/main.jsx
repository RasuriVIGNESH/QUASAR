import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "@/components/theme-provider"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Updated storage key to professional-ui */}
    <ThemeProvider defaultTheme="light" storageKey="professional-ui-theme" attribute="data-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
)