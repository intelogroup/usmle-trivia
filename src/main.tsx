import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexReactClient } from "convex/react"
import { ClerkProvider } from "@clerk/clerk-react"
import { ConvexClerkProvider } from './providers/ConvexClerkProvider'
import { getConvexUrl, logEnvironmentInfo } from './utils/envValidation'
import './index.css'
import App from './App.tsx'

// Enhanced startup logging
console.log('🚀 Starting Usmle Trivia application...')
console.log('📍 Current URL:', window.location.href)
console.log('🌐 Environment:', import.meta.env.MODE)
console.log('🔧 Build:', import.meta.env.PROD ? 'Production' : 'Development')

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('🚨 Global JavaScript Error:', {
    message: event.error?.message || 'Unknown error',
    filename: event.filename,
    line: event.lineno,
    column: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString()
  })
})

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', {
    reason: event.reason,
    timestamp: new Date().toISOString()
  })
})

// Validate environment and log info
console.log('🔍 Starting environment validation...')
try {
  logEnvironmentInfo();
  console.log('✅ Environment validation successful')
} catch (error) {
  console.error('🚨 Environment validation failed. Please check your configuration:', error);
  console.error('📋 Error details:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  })
  
  // In production, we might want to show an error page instead of crashing
  if (import.meta.env.PROD) {
    console.error('💥 Blocking app startup due to environment validation failure in production')
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5; font-family: system-ui;">
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #dc2626; margin-bottom: 1rem;">Configuration Error</h2>
          <p style="color: #6b7280; margin-bottom: 1rem;">The application is not properly configured.</p>
          <p style="color: #6b7280; font-size: 0.875rem;">Please contact support if this issue persists.</p>
          <details style="margin-top: 1rem; text-align: left;">
            <summary style="cursor: pointer; color: #374151;">Error Details</summary>
            <pre style="background: #f9fafb; padding: 0.5rem; font-size: 0.75rem; overflow: auto; margin-top: 0.5rem;">${error.message}</pre>
          </details>
        </div>
      </div>
    `;
    throw error;
  } else {
    console.warn('⚠️ Continuing in development mode despite validation failure')
  }
}

// Initialize Convex client with validated URL and authentication
console.log('🔗 Initializing Convex client...')
let convex: ConvexReactClient
try {
  const convexUrl = getConvexUrl()
  console.log('📡 Convex URL:', convexUrl)
  convex = new ConvexReactClient(convexUrl)
  console.log('✅ Convex client initialized successfully')
} catch (error) {
  console.error('🚨 Failed to initialize Convex client:', error)
  throw error
}

// Get Clerk publishable key
console.log('🔑 Checking Clerk configuration...')
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

console.log('🔑 Clerk key present:', !!CLERK_PUBLISHABLE_KEY)
console.log('🔑 Clerk key prefix:', CLERK_PUBLISHABLE_KEY ? CLERK_PUBLISHABLE_KEY.substring(0, 20) + '...' : 'MISSING')

if (!CLERK_PUBLISHABLE_KEY) {
  console.error('🚨 Missing Clerk Publishable Key - VITE_CLERK_PUBLISHABLE_KEY not set')
  throw new Error("Missing Clerk Publishable Key")
}

// Check if DOM root element exists
console.log('🎯 Checking DOM root element...')
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('🚨 Root element not found in DOM')
  throw new Error('Root element not found')
}
console.log('✅ Root element found')

console.log('🎨 Starting React application render...')
try {
  createRoot(rootElement).render(
    <StrictMode>
      <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY} 
        afterSignOutUrl="/"
        appearance={{
          baseTheme: 'light'
        }}
      >
        <ConvexClerkProvider client={convex}>
          <App />
        </ConvexClerkProvider>
      </ClerkProvider>
    </StrictMode>,
  )
  console.log('✅ React application rendered successfully')
} catch (error) {
  console.error('🚨 Failed to render React application:', error)
  throw error
}