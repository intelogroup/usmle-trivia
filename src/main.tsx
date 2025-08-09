import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Temporary fix: Remove ConvexProvider to allow local development without authentication
// The app now uses local QuizEngine that doesn't require Convex
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
