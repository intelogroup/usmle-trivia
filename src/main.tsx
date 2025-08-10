import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexReactClient } from "convex/react"
import { ConvexAuthProvider } from "@convex-dev/auth/react"
import { getConvexUrl, logEnvironmentInfo } from './utils/envValidation'
import './index.css'
import App from './App.tsx'

// Validate environment and log info
try {
  logEnvironmentInfo();
} catch (error) {
  console.error('🚨 Environment validation failed. Please check your configuration:', error);
  // In production, we might want to show an error page instead of crashing
  if (import.meta.env.NODE_ENV === 'production') {
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; font-family: system-ui;">
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #dc2626; margin-bottom: 1rem;">Configuration Error</h2>
          <p style="color: #6b7280; margin-bottom: 1rem;">The application is not properly configured.</p>
          <p style="color: #6b7280; font-size: 0.875rem;">Please contact support if this issue persists.</p>
        </div>
      </div>
    `;
    throw error;
  }
}

// Initialize Convex client with validated URL
const convex = new ConvexReactClient(getConvexUrl())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </StrictMode>,
)
