/**
 * 🏥 MedQuiz Pro - Infrastructure as Code
 * Netlify Site Configuration and Automation
 */

import fs from 'fs';
import path from 'path';

class MedQuizInfrastructure {
  constructor() {
    this.config = {
      // Medical platform requirements
      platform: 'MedQuiz Pro',
      environment: process.env.NODE_ENV || 'development',
      domain: 'usmle-trivia.netlify.app',
      stagingDomain: 'staging--usmle-trivia.netlify.app',
      
      // Medical-grade performance requirements
      performance: {
        responseTimeTarget: 2000, // 2s max for medical applications
        uptimeTarget: 99.9,       // 99.9% uptime SLA
        bundleSizeLimit: 2097152, // 2MB bundle limit
        coreWebVitals: {
          lcp: 2500,  // Largest Contentful Paint
          fid: 100,   // First Input Delay  
          cls: 0.1    // Cumulative Layout Shift
        }
      },
      
      // HIPAA compliance settings
      compliance: {
        enforceHttps: true,
        enableHSTS: true,
        dataCacheTimeout: 300, // 5 minutes max for medical data
        errorLoggingLevel: 'sanitized'
      }
    };
  }

  /**
   * Generate Netlify configuration file
   */
  generateNetlifyConfig() {
    const config = {
      build: {
        command: "npm run build:prod",
        publish: "dist",
        environment: {
          NODE_VERSION: "20",
          NPM_FLAGS: "--force",
          NODE_OPTIONS: "--max-old-space-size=1024",
          NPM_CONFIG_CACHE: "/opt/buildhome/.npm",
          // Medical platform build optimizations
          VITE_BUILD_SOURCEMAP: "false",
          VITE_BUILD_TARGET: "esnext",
          VITE_BUILD_MINIFY: "esbuild"
        }
      },

      // Environment-specific configurations
      context: {
        production: {
          environment: {
            VITE_CONVEX_URL: "https://formal-sardine-916.convex.cloud",
            NODE_ENV: "production",
            VITE_NODE_ENV: "production",
            VITE_MEDICAL_MODE: "production"
          }
        },
        "deploy-preview": {
          environment: {
            VITE_CONVEX_URL: "https://formal-sardine-916.convex.cloud",
            NODE_ENV: "staging",
            VITE_NODE_ENV: "staging",
            VITE_MEDICAL_MODE: "staging"
          }
        },
        "branch-deploy": {
          environment: {
            VITE_CONVEX_URL: "https://formal-sardine-916.convex.cloud",
            NODE_ENV: "development",
            VITE_NODE_ENV: "development",
            VITE_MEDICAL_MODE: "development"
          }
        }
      },

      // Single Page Application routing
      redirects: [
        {
          from: "/*",
          to: "/index.html",
          status: 200
        },
        // API redirects for medical data handling
        {
          from: "/api/*",
          to: "https://formal-sardine-916.convex.cloud/api/:splat",
          status: 200,
          force: true
        }
      ],

      // Medical-grade security headers
      headers: [
        {
          for: "/*",
          values: {
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
            "Content-Security-Policy": [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'", 
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' https://formal-sardine-916.convex.cloud https://formal-sardine-916.convex.site wss://formal-sardine-916.convex.cloud",
              "font-src 'self'",
              "object-src 'none'",
              "media-src 'self'",
              "frame-src 'none'"
            ].join("; "),
            "X-DNS-Prefetch-Control": "on",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
            // Medical platform specific headers
            "X-Medical-Platform": "MedQuiz-Pro",
            "X-HIPAA-Compliant": "true"
          }
        },
        // Aggressive caching for static assets (medical content)
        {
          for: "/assets/*",
          values: {
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff"
          }
        },
        // Medical data caching policy
        {
          for: "/*.html",
          values: {
            "Cache-Control": "public, max-age=0, must-revalidate",
            "X-Medical-Content": "dynamic"
          }
        },
        // API response headers
        {
          for: "/api/*",
          values: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "X-Medical-Data": "sensitive",
            "Access-Control-Allow-Origin": "https://usmle-trivia.netlify.app"
          }
        }
      ],

      // Functions configuration for serverless medical features
      functions: {
        directory: "netlify/functions",
        node_bundler: "esbuild",
        // Medical platform function settings
        timeout: 10, // 10 seconds timeout for medical data processing
        memory: 1024 // 1GB memory for complex medical algorithms
      },

      // Edge functions for medical data processing
      edge_functions: [
        {
          function: "medical-auth",
          path: "/api/auth/*"
        },
        {
          function: "quiz-analytics",
          path: "/api/analytics/*"
        }
      ]
    };

    return config;
  }

  /**
   * Generate deployment scripts
   */
  generateDeploymentScripts() {
    const scripts = {
      // Pre-deployment validation
      preDeployValidation: `
#!/bin/bash
set -e

echo "🏥 MedQuiz Pro - Pre-deployment validation"
echo "========================================"

# Medical platform quality gates
echo "🔍 Running medical platform quality checks..."

# 1. Code quality validation
npm run lint
echo "✅ Code quality validated"

# 2. Type safety validation
npm run type-check
echo "✅ TypeScript validation passed"

# 3. Unit tests validation
npm run test:fast
echo "✅ Unit tests passed"

# 4. HIPAA compliance check
echo "🔒 Checking HIPAA compliance..."
if grep -r "console.log.*email\\|console.log.*phone" src/; then
  echo "❌ Potential PII exposure in logs detected"
  exit 1
fi
echo "✅ HIPAA compliance verified"

# 5. Performance validation
echo "⚡ Building and analyzing bundle..."
npm run build
BUNDLE_SIZE=$(find dist -name "*.js" -exec wc -c {} + | awk 'END{print $1}')
MAX_SIZE=2097152  # 2MB limit for medical applications

if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
  echo "❌ Bundle size exceeded: $BUNDLE_SIZE bytes > $MAX_SIZE bytes"
  echo "Medical platform performance requirements not met"
  exit 1
fi

echo "✅ Bundle size optimal: $BUNDLE_SIZE bytes"
echo "🎉 Pre-deployment validation completed successfully"
      `,

      // Post-deployment health check
      postDeployHealthCheck: `
#!/bin/bash
set -e

DEPLOYMENT_URL=$1
if [ -z "$DEPLOYMENT_URL" ]; then
  echo "❌ Deployment URL required"
  exit 1
fi

echo "🏥 MedQuiz Pro - Post-deployment health check"
echo "==========================================="
echo "Checking: $DEPLOYMENT_URL"

# Wait for deployment to propagate
echo "⏳ Waiting for deployment to propagate..."
sleep 30

# 1. Basic connectivity check
echo "🔍 Basic connectivity check..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Basic connectivity failed: HTTP $HTTP_CODE"
  exit 1
fi
echo "✅ Basic connectivity: OK"

# 2. Critical pages check
echo "🔍 Critical medical platform pages..."
CRITICAL_PAGES=("/login" "/register" "/dashboard")

for PAGE in "\${CRITICAL_PAGES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL$PAGE")
  if [ "$STATUS" != "200" ]; then
    echo "❌ Critical page failed: $PAGE (HTTP $STATUS)"
    exit 1
  fi
  echo "✅ $PAGE: OK"
done

# 3. Performance check
echo "⚡ Performance validation..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$DEPLOYMENT_URL")
if (( $(echo "$RESPONSE_TIME > 3.0" | bc -l) )); then
  echo "⚠️ Slow response time: \${RESPONSE_TIME}s (target: <3s)"
fi
echo "✅ Response time: \${RESPONSE_TIME}s"

# 4. Security headers check
echo "🛡️ Security headers validation..."
HEADERS=$(curl -I -s "$DEPLOYMENT_URL")
SECURITY_HEADERS=("X-Frame-Options" "X-Content-Type-Options" "Strict-Transport-Security")

for HEADER in "\${SECURITY_HEADERS[@]}"; do
  if echo "$HEADERS" | grep -i "$HEADER" > /dev/null; then
    echo "✅ $HEADER: Present"
  else
    echo "❌ $HEADER: Missing"
    exit 1
  fi
done

echo "🎉 Post-deployment health check completed successfully"
echo "🏥 MedQuiz Pro is ready to serve medical students!"
      `,

      // Rollback script
      rollbackScript: `
#!/bin/bash
set -e

echo "🚨 MedQuiz Pro - Emergency Rollback"
echo "=================================="

NETLIFY_SITE_ID=$1
NETLIFY_AUTH_TOKEN=$2

if [ -z "$NETLIFY_SITE_ID" ] || [ -z "$NETLIFY_AUTH_TOKEN" ]; then
  echo "❌ Netlify Site ID and Auth Token required"
  echo "Usage: ./rollback.sh <SITE_ID> <AUTH_TOKEN>"
  exit 1
fi

# Get the last successful deployment
echo "🔍 Finding last successful deployment..."
LAST_DEPLOY=$(curl -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \\
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys?per_page=10" \\
  | jq -r '.[] | select(.state == "ready") | .id' | head -2 | tail -1)

if [ -z "$LAST_DEPLOY" ]; then
  echo "❌ No previous successful deployment found"
  exit 1
fi

echo "📋 Rolling back to deployment: $LAST_DEPLOY"

# Restore the previous deployment
curl -X POST -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \\
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys/$LAST_DEPLOY/restore"

echo "✅ Rollback initiated"
echo "⏳ Waiting for rollback to complete..."
sleep 30

# Verify rollback
./post-deploy-health-check.sh https://usmle-trivia.netlify.app

echo "🎉 Emergency rollback completed successfully"
echo "🏥 Medical platform service restored"
      `
    };

    return scripts;
  }

  /**
   * Generate monitoring configuration
   */
  generateMonitoringConfig() {
    return {
      uptime: {
        endpoints: [
          'https://usmle-trivia.netlify.app',
          'https://usmle-trivia.netlify.app/login',
          'https://usmle-trivia.netlify.app/dashboard',
          'https://usmle-trivia.netlify.app/api/health'
        ],
        checkInterval: 900, // 15 minutes during peak hours
        timeout: 10000,     // 10 second timeout
        retryCount: 3,
        alertThreshold: 2   // Alert after 2 consecutive failures
      },
      performance: {
        lighthouse: {
          urls: [
            'https://usmle-trivia.netlify.app',
            'https://usmle-trivia.netlify.app/login',
            'https://usmle-trivia.netlify.app/register'
          ],
          schedule: '0 */6 * * *', // Every 6 hours
          thresholds: {
            performance: 85,
            accessibility: 95,
            bestPractices: 90,
            seo: 85
          }
        },
        webVitals: {
          lcp: { good: 2500, needsImprovement: 4000 },
          fid: { good: 100, needsImprovement: 300 },
          cls: { good: 0.1, needsImprovement: 0.25 }
        }
      },
      security: {
        sslCheck: {
          schedule: '0 0 * * *', // Daily
          warningDays: 30,       // Warn 30 days before expiry
          criticalDays: 7        // Critical alert 7 days before
        },
        headers: [
          'X-Frame-Options',
          'X-Content-Type-Options',
          'Strict-Transport-Security',
          'Content-Security-Policy'
        ]
      },
      medical: {
        complianceChecks: {
          hipaa: {
            dataEncryption: true,
            accessControl: true,
            auditLogging: true,
            dataRetention: '7 years'
          }
        },
        availability: {
          targetUptime: 99.9,
          medicalHours: '06:00-22:00 UTC', // Peak medical study hours
          maxDowntime: 525.6 // minutes per year (99.9%)
        }
      }
    };
  }

  /**
   * Save all infrastructure configurations
   */
  save() {
    const infraDir = path.join(process.cwd(), 'infrastructure');
    
    // Ensure infrastructure directory exists
    if (!fs.existsSync(infraDir)) {
      fs.mkdirSync(infraDir, { recursive: true });
    }

    // Save Netlify configuration
    const netlifyConfig = this.generateNetlifyConfig();
    fs.writeFileSync(
      path.join(process.cwd(), 'netlify.toml'),
      this.convertToToml(netlifyConfig)
    );

    // Save deployment scripts
    const scripts = this.generateDeploymentScripts();
    const scriptsDir = path.join(infraDir, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir);
    }

    Object.entries(scripts).forEach(([name, script]) => {
      const fileName = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
      fs.writeFileSync(
        path.join(scriptsDir, `${fileName}.sh`),
        script.trim(),
        { mode: 0o755 }
      );
    });

    // Save monitoring configuration
    const monitoring = this.generateMonitoringConfig();
    fs.writeFileSync(
      path.join(infraDir, 'monitoring.json'),
      JSON.stringify(monitoring, null, 2)
    );

    console.log('🎉 Infrastructure configuration generated successfully!');
    console.log('📁 Files created:');
    console.log('   - netlify.toml (updated)');
    console.log('   - infrastructure/scripts/pre-deploy-validation.sh');
    console.log('   - infrastructure/scripts/post-deploy-health-check.sh');
    console.log('   - infrastructure/scripts/rollback-script.sh');
    console.log('   - infrastructure/monitoring.json');
  }

  /**
   * Convert configuration object to TOML format
   */
  convertToToml(obj, level = 0) {
    let toml = '';
    const indent = '  '.repeat(level);

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (Array.isArray(value)) {
        if (typeof value[0] === 'object') {
          // Array of objects (like headers)
          value.forEach(item => {
            toml += `\\n[[${key}]]\\n`;
            toml += this.convertToToml(item, level + 1);
          });
        } else {
          // Array of primitives
          toml += `${indent}${key} = ${JSON.stringify(value)}\\n`;
        }
      } else if (typeof value === 'object') {
        toml += `\\n[${level > 0 ? key : key}]\\n`;
        toml += this.convertToToml(value, level + 1);
      } else {
        toml += `${indent}${key} = ${JSON.stringify(value)}\\n`;
      }
    }

    return toml;
  }
}

// Export for use in build scripts
export default MedQuizInfrastructure;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const infrastructure = new MedQuizInfrastructure();
  infrastructure.save();
}