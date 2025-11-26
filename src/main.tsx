import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WebContainerProvider } from '#context/WebContainerContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebContainerProvider>
      <App />
    </WebContainerProvider>
  </StrictMode>,
)
