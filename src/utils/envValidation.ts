/**
 * Environment Validation Utility
 * Validates that all required environment variables are properly configured
 * and provides helpful error messages for missing or invalid values
 */

interface EnvironmentConfig {
  convexUrl: string;
  nodeEnv: 'development' | 'production';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  features: {
    analytics: boolean;
    errorReporting: boolean;
    performanceMonitoring: boolean;
  };
  quiz: {
    maxQuestionsPerQuiz: number;
    defaultTimeLimit: number;
  };
  security: {
    cspEnabled: boolean;
    forceHttps: boolean;
    hipaaCompliant: boolean;
  };
}

/**
 * Gets environment variable with type safety and validation
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;
  if (!value) {
    console.error(`❌ Missing required environment variable: ${key}`);
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

/**
 * Gets boolean environment variable
 */
function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Gets numeric environment variable
 */
function getNumberEnv(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`⚠️ Invalid number for ${key}: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Validates and returns the complete environment configuration
 */
export function validateEnvironment(): EnvironmentConfig {
  console.info('🔍 Validating environment configuration...');
  
  try {
    const config: EnvironmentConfig = {
      // Convex backend configuration
      convexUrl: getEnvVar('VITE_CONVEX_URL'),
      
      // Environment settings - determined by Vite automatically
      nodeEnv: (import.meta.env.PROD ? 'production' : 'development') as EnvironmentConfig['nodeEnv'],
      logLevel: (getEnvVar('VITE_LOG_LEVEL', 'info') as EnvironmentConfig['logLevel']),
      
      // Feature flags
      features: {
        analytics: getBooleanEnv('VITE_FEATURE_ANALYTICS', true),
        errorReporting: getBooleanEnv('VITE_FEATURE_ERROR_REPORTING', true),
        performanceMonitoring: getBooleanEnv('VITE_FEATURE_PERFORMANCE_MONITORING', true),
      },
      
      // Quiz configuration
      quiz: {
        maxQuestionsPerQuiz: getNumberEnv('VITE_MAX_QUESTIONS_PER_QUIZ', 50),
        defaultTimeLimit: getNumberEnv('VITE_DEFAULT_QUIZ_TIME_LIMIT', 300), // 5 minutes
      },
      
      // Security settings
      security: {
        cspEnabled: getBooleanEnv('VITE_CSP_ENABLED', true),
        forceHttps: getBooleanEnv('VITE_FORCE_HTTPS', false),
        hipaaCompliant: getBooleanEnv('VITE_HIPAA_COMPLIANT_ERRORS', true),
      },
    };
    
    // Validate Convex URL format
    if (!config.convexUrl.startsWith('https://')) {
      throw new Error('VITE_CONVEX_URL must be a valid HTTPS URL');
    }
    
    // Environment is automatically determined by Vite (import.meta.env.PROD/DEV)
    // No manual NODE_ENV validation needed
    
    // Log configuration summary
    console.info('✅ Environment validation successful');
    console.info(`📊 Configuration summary:
      Environment: ${config.nodeEnv}
      Convex URL: ${config.convexUrl}
      Features enabled: ${Object.entries(config.features)
        .filter(([, enabled]) => enabled)
        .map(([name]) => name)
        .join(', ')}
      Quiz limits: ${config.quiz.maxQuestionsPerQuiz} questions, ${config.quiz.defaultTimeLimit}s time limit
      Security: HIPAA compliant=${config.security.hipaaCompliant}, HTTPS forced=${config.security.forceHttps}
    `);
    
    return config;
    
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    
    // In development, show helpful setup instructions
    if (import.meta.env.NODE_ENV === 'development') {
      console.info(`
📋 Setup Instructions:
1. Copy .env.example to .env.local
2. Set VITE_CONVEX_URL to your Convex deployment URL
3. Run 'convex dev' to start your backend
4. Restart your development server

For production deployment:
1. Set environment variables in your hosting provider
2. Ensure all VITE_ prefixed variables are available to the build process
      `);
    }
    
    throw error;
  }
}

/**
 * Gets the current environment configuration
 * This is memoized to avoid repeated validation calls
 */
let environmentConfig: EnvironmentConfig | null = null;

export function getEnvironmentConfig(): EnvironmentConfig {
  if (!environmentConfig) {
    environmentConfig = validateEnvironment();
  }
  return environmentConfig;
}

/**
 * Checks if we're running in production
 */
export function isProduction(): boolean {
  return getEnvironmentConfig().nodeEnv === 'production';
}

/**
 * Checks if we're running in development
 */
export function isDevelopment(): boolean {
  return getEnvironmentConfig().nodeEnv === 'development';
}

/**
 * Gets the Convex URL with validation
 */
export function getConvexUrl(): string {
  return getEnvironmentConfig().convexUrl;
}

/**
 * Logs environment information for debugging
 */
export function logEnvironmentInfo(): void {
  const config = getEnvironmentConfig();
  
  console.group('🌍 Environment Information');
  console.info('Node Environment:', config.nodeEnv);
  console.info('Vite Environment:', config.viteEnv);
  console.info('Convex URL:', config.convexUrl);
  console.info('Features:', config.features);
  console.info('Quiz Config:', config.quiz);
  console.info('Security Config:', config.security);
  console.groupEnd();
}

// Run validation on module import in development
if (import.meta.env.NODE_ENV === 'development') {
  try {
    validateEnvironment();
  } catch (error) {
    // Non-blocking in development - just warn
    console.warn('Environment validation failed in development mode:', error);
  }
}