import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { bootstrapUi } from './bootstrap'
import './index.css'
import App from './App.tsx'

bootstrapUi()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
