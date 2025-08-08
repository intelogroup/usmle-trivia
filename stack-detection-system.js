/**
 * 🧠 Intelligent Stack Detection System
 * Automatically detects project technology stack and adapts agent MCP selection
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export class StackDetectionSystem {
  constructor(projectPath = '.') {
    this.projectPath = projectPath;
    this.cache = new Map();
  }

  /**
   * 🎯 Main entry point - detects complete project stack
   */
  async detectProjectStack() {
    const cacheKey = 'project-stack';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    console.log('🔍 Detecting project technology stack...');

    const stack = {
      frontend: await this.detectFrontend(),
      backend: await this.detectBackend(),
      deployment: await this.detectDeployment(),
      testing: await this.detectTesting(),
      styling: await this.detectStyling(),
      state: await this.detectStateManagement(),
      routing: await this.detectRouting(),
      database: await this.detectDatabase(),
      specializations: await this.detectSpecializations(),
      timestamp: new Date().toISOString()
    };

    const enhancedStack = this.validateAndEnhanceStack(stack);
    this.cache.set(cacheKey, enhancedStack);
    
    console.log('✅ Stack detection complete:', {
      frontend: `${enhancedStack.frontend?.framework} ${enhancedStack.frontend?.version}`,
      backend: enhancedStack.backend?.service,
      deployment: enhancedStack.deployment?.platform
    });

    return enhancedStack;
  }

  /**
   * 📱 Detect frontend framework and build tools
   */
  async detectFrontend() {
    const packageJson = this.readPackageJson();
    if (!packageJson) return null;

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // React Detection (Priority 1 - Current Stack)
    if (dependencies.react) {
      const buildTool = this.detectBuildTool(packageJson);
      return {
        framework: 'React',
        version: dependencies.react.replace('^', ''),
        buildTool: buildTool.name,
        buildVersion: buildTool.version,
        language: dependencies.typescript ? 'TypeScript' : 'JavaScript',
        features: this.detectReactFeatures(dependencies),
        confidence: 0.95
      };
    }

    // Vue Detection
    if (dependencies.vue) {
      return {
        framework: 'Vue',
        version: dependencies.vue.replace('^', ''),
        buildTool: dependencies['@vitejs/plugin-vue'] ? 'Vite' : 'Webpack',
        language: dependencies.typescript ? 'TypeScript' : 'JavaScript',
        features: this.detectVueFeatures(dependencies),
        confidence: 0.90
      };
    }

    // Svelte Detection
    if (dependencies.svelte) {
      return {
        framework: 'Svelte',
        version: dependencies.svelte.replace('^', ''),
        buildTool: 'SvelteKit',
        language: dependencies.typescript ? 'TypeScript' : 'JavaScript',
        features: this.detectSvelteFeatures(dependencies),
        confidence: 0.90
      };
    }

    // Angular Detection
    if (dependencies['@angular/core']) {
      return {
        framework: 'Angular',
        version: dependencies['@angular/core'].replace('^', ''),
        buildTool: 'Angular CLI',
        language: 'TypeScript',
        features: this.detectAngularFeatures(dependencies),
        confidence: 0.90
      };
    }

    return null;
  }

  /**
   * 🗄️ Detect backend services and databases
   */
  async detectBackend() {
    const packageJson = this.readPackageJson();
    if (!packageJson) return null;

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const scripts = packageJson.scripts || {};

    // Convex Detection (Priority 1 - Current Stack)
    if (dependencies.convex || scripts['convex:dev'] || scripts['convex:deploy']) {
      const convexConfig = this.detectConvexConfig();
      return {
        service: 'Convex',
        type: 'Real-time Database',
        version: dependencies.convex?.replace('^', ''),
        websocket: true,
        functions: true,
        config: convexConfig,
        confidence: 0.95
      };
    }

    // Supabase Detection
    if (dependencies['@supabase/supabase-js']) {
      return {
        service: 'Supabase',
        type: 'PostgreSQL + Real-time',
        version: dependencies['@supabase/supabase-js'].replace('^', ''),
        features: ['row-level-security', 'edge-functions', 'storage'],
        confidence: 0.90
      };
    }

    // Firebase Detection
    if (dependencies.firebase) {
      return {
        service: 'Firebase',
        type: 'NoSQL Database',
        version: dependencies.firebase.replace('^', ''),
        features: ['realtime-database', 'cloud-functions', 'auth'],
        confidence: 0.90
      };
    }

    // Neon Detection
    if (dependencies['@neondatabase/serverless'] || dependencies['neon']) {
      return {
        service: 'Neon',
        type: 'Serverless PostgreSQL',
        features: ['database-branching', 'connection-pooling', 'auto-scaling'],
        confidence: 0.85
      };
    }

    // Prisma Detection (ORM, not backend but indicates database usage)
    if (dependencies.prisma || dependencies['@prisma/client']) {
      return {
        service: 'Prisma ORM',
        type: 'Database ORM',
        features: ['type-safety', 'migrations', 'introspection'],
        confidence: 0.80
      };
    }

    return null;
  }

  /**
   * 🚀 Detect deployment platform and configuration
   */
  async detectDeployment() {
    // Netlify Detection (Priority 1 - Current Stack)
    const netlifyConfig = this.readNetlifyConfig();
    if (netlifyConfig) {
      return {
        platform: 'Netlify',
        config: netlifyConfig,
        features: this.detectNetlifyFeatures(netlifyConfig),
        buildCommand: netlifyConfig.build?.command || 'npm run build',
        publishDir: netlifyConfig.build?.publish || 'dist',
        confidence: 0.95
      };
    }

    // Vercel Detection
    const vercelConfig = this.readVercelConfig();
    if (vercelConfig) {
      return {
        platform: 'Vercel',
        config: vercelConfig,
        features: ['edge-runtime', 'serverless-functions', 'preview-deployments'],
        confidence: 0.90
      };
    }

    // AWS Detection
    const packageJson = this.readPackageJson();
    if (packageJson?.dependencies?.['aws-sdk'] || packageJson?.devDependencies?.['@aws-cdk/core']) {
      return {
        platform: 'AWS',
        features: ['lambda', 'cloudfront', 's3', 'cloudformation'],
        confidence: 0.85
      };
    }

    // Docker Detection
    if (existsSync(join(this.projectPath, 'Dockerfile')) || existsSync(join(this.projectPath, 'docker-compose.yml'))) {
      return {
        platform: 'Docker',
        features: ['containerization', 'orchestration'],
        confidence: 0.80
      };
    }

    return null;
  }

  /**
   * 🧪 Detect testing frameworks and tools
   */
  async detectTesting() {
    const packageJson = this.readPackageJson();
    if (!packageJson) return null;

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const scripts = packageJson.scripts || {};

    const testing = {
      frameworks: [],
      features: [],
      confidence: 0
    };

    // Playwright Detection (Priority 1 - Current Stack)
    if (dependencies['@playwright/test'] || dependencies.playwright) {
      testing.frameworks.push({
        name: 'Playwright',
        type: 'E2E',
        version: dependencies['@playwright/test']?.replace('^', ''),
        features: ['cross-browser', 'visual-testing', 'mobile-testing']
      });
      testing.confidence += 0.25;
    }

    // Vitest Detection (Current Stack)
    if (dependencies.vitest) {
      testing.frameworks.push({
        name: 'Vitest',
        type: 'Unit',
        version: dependencies.vitest.replace('^', ''),
        features: ['fast-execution', 'typescript-support', 'coverage']
      });
      testing.confidence += 0.25;
    }

    // Storybook Detection (Current Stack)
    if (dependencies.storybook || dependencies['@storybook/react']) {
      testing.frameworks.push({
        name: 'Storybook',
        type: 'Component',
        version: dependencies.storybook?.replace('^', ''),
        features: ['component-stories', 'visual-testing', 'documentation']
      });
      testing.confidence += 0.25;
    }

    // Jest Detection
    if (dependencies.jest) {
      testing.frameworks.push({
        name: 'Jest',
        type: 'Unit',
        version: dependencies.jest.replace('^', ''),
        features: ['snapshot-testing', 'mocking', 'coverage']
      });
      testing.confidence += 0.20;
    }

    // Cypress Detection
    if (dependencies.cypress) {
      testing.frameworks.push({
        name: 'Cypress',
        type: 'E2E',
        version: dependencies.cypress.replace('^', ''),
        features: ['time-travel-debugging', 'real-browser-testing', 'visual-testing']
      });
      testing.confidence += 0.20;
    }

    // Testing Library Detection
    if (dependencies['@testing-library/react'] || dependencies['@testing-library/jest-dom']) {
      testing.frameworks.push({
        name: 'Testing Library',
        type: 'Component',
        features: ['user-centric-testing', 'accessibility-testing']
      });
      testing.confidence += 0.15;
    }

    return testing.frameworks.length > 0 ? testing : null;
  }

  /**
   * 🎨 Detect styling frameworks and tools
   */
  async detectStyling() {
    const packageJson = this.readPackageJson();
    if (!packageJson) return null;

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const styling = {
      frameworks: [],
      features: [],
      confidence: 0
    };

    // Tailwind CSS Detection (Priority 1 - Current Stack)
    if (dependencies.tailwindcss) {
      styling.frameworks.push({
        name: 'Tailwind CSS',
        version: dependencies.tailwindcss.replace('^', ''),
        features: ['utility-first', 'responsive-design', 'dark-mode']
      });
      styling.confidence += 0.40;
    }

    // Radix UI Detection (Current Stack)
    if (dependencies['@radix-ui/react-dropdown-menu']) {
      styling.frameworks.push({
        name: 'Radix UI',
        type: 'Component Library',
        features: ['accessibility', 'unstyled-components', 'primitives']
      });
      styling.confidence += 0.20;
    }

    // Framer Motion Detection (Current Stack)
    if (dependencies['framer-motion']) {
      styling.frameworks.push({
        name: 'Framer Motion',
        type: 'Animation',
        version: dependencies['framer-motion'].replace('^', ''),
        features: ['gesture-animations', 'layout-animations', 'svg-animations']
      });
      styling.confidence += 0.15;
    }

    // Styled Components Detection
    if (dependencies['styled-components']) {
      styling.frameworks.push({
        name: 'Styled Components',
        type: 'CSS-in-JS',
        features: ['component-styling', 'theming', 'server-side-rendering']
      });
      styling.confidence += 0.15;
    }

    // Material-UI Detection
    if (dependencies['@mui/material'] || dependencies['@material-ui/core']) {
      styling.frameworks.push({
        name: 'Material-UI',
        type: 'Component Library',
        features: ['material-design', 'theming', 'accessibility']
      });
      styling.confidence += 0.15;
    }

    return styling.frameworks.length > 0 ? styling : null;
  }

  /**
   * 🔄 Detect state management solutions
   */
  async detectStateManagement() {
    const packageJson = this.readPackageJson();
    if (!packageJson) return null;

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Zustand Detection (Priority 1 - Current Stack)
    if (dependencies.zustand) {
      return {
        library: 'Zustand',
        version: dependencies.zustand.replace('^', ''),
        type: 'Lightweight State Management',
        features: ['typescript-support', 'devtools', 'persistence'],
        confidence: 0.95
      };
    }

    // Redux Detection
    if (dependencies.redux || dependencies['@reduxjs/toolkit']) {
      return {
        library: 'Redux',
        version: dependencies.redux?.replace('^', '') || dependencies['@reduxjs/toolkit'].replace('^', ''),
        type: 'Predictable State Container',
        features: ['time-travel-debugging', 'middleware', 'devtools'],
        confidence: 0.90
      };
    }

    // Jotai Detection
    if (dependencies.jotai) {
      return {
        library: 'Jotai',
        version: dependencies.jotai.replace('^', ''),
        type: 'Atomic State Management',
        features: ['bottom-up-approach', 'typescript-support'],
        confidence: 0.85
      };
    }

    return null;
  }

  /**
   * 🧭 Detect routing solutions
   */
  async detectRouting() {
    const packageJson = this.readPackageJson();
    if (!packageJson) return null;

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // React Router Detection (Priority 1 - Current Stack)
    if (dependencies['react-router-dom']) {
      return {
        library: 'React Router DOM',
        version: dependencies['react-router-dom'].replace('^', ''),
        features: ['nested-routing', 'data-loading', 'code-splitting'],
        confidence: 0.95
      };
    }

    // Next.js Router (built-in)
    if (dependencies.next) {
      return {
        library: 'Next.js Router',
        version: dependencies.next.replace('^', ''),
        features: ['app-router', 'pages-router', 'dynamic-routes'],
        confidence: 0.90
      };
    }

    return null;
  }

  /**
   * 🗄️ Detect database configurations
   */
  async detectDatabase() {
    const backend = await this.detectBackend();
    if (!backend) return null;

    // Map backend services to database types
    const databaseMapping = {
      'Convex': {
        type: 'Real-time Document Database',
        features: ['websocket-subscriptions', 'server-functions', 'real-time-queries']
      },
      'Supabase': {
        type: 'PostgreSQL with Real-time',
        features: ['row-level-security', 'real-time-subscriptions', 'edge-functions']
      },
      'Firebase': {
        type: 'NoSQL Document Database',
        features: ['real-time-listeners', 'offline-support', 'cloud-functions']
      },
      'Neon': {
        type: 'Serverless PostgreSQL',
        features: ['database-branching', 'connection-pooling', 'auto-scaling']
      }
    };

    return databaseMapping[backend.service] || null;
  }

  /**
   * 🏥 Detect medical/healthcare specializations
   */
  async detectSpecializations() {
    const packageJson = this.readPackageJson();
    const specializations = {
      medical: false,
      usmle: false,
      hipaa: false,
      accessibility: false,
      confidence: 0
    };

    // Check package.json name and description for medical keywords
    const medicalKeywords = ['medical', 'usmle', 'healthcare', 'clinical', 'quiz', 'trivia', 'medquiz'];
    const projectName = packageJson?.name?.toLowerCase() || '';
    const projectDescription = packageJson?.description?.toLowerCase() || '';

    if (medicalKeywords.some(keyword => projectName.includes(keyword) || projectDescription.includes(keyword))) {
      specializations.medical = true;
      specializations.usmle = projectName.includes('usmle') || projectDescription.includes('usmle');
      specializations.confidence += 0.40;
    }

    // Check for accessibility dependencies
    const dependencies = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
    if (dependencies?.['axe-core'] || dependencies?.['jest-axe']) {
      specializations.accessibility = true;
      specializations.confidence += 0.20;
    }

    // Check for HIPAA-related configurations in deployment
    const netlifyConfig = this.readNetlifyConfig();
    if (netlifyConfig?.headers && JSON.stringify(netlifyConfig).includes('X-Frame-Options')) {
      specializations.hipaa = true;
      specializations.confidence += 0.20;
    }

    return specializations.confidence > 0 ? specializations : null;
  }

  /**
   * 🔧 Helper Methods
   */
  readPackageJson() {
    const packagePath = join(this.projectPath, 'package.json');
    if (!existsSync(packagePath)) return null;

    try {
      return JSON.parse(readFileSync(packagePath, 'utf8'));
    } catch (error) {
      console.warn('⚠️ Could not read package.json:', error.message);
      return null;
    }
  }

  readNetlifyConfig() {
    const netlifyPath = join(this.projectPath, 'netlify.toml');
    if (!existsSync(netlifyPath)) return null;

    try {
      const content = readFileSync(netlifyPath, 'utf8');
      // Simple TOML parsing for basic structure
      return this.parseSimpleToml(content);
    } catch (error) {
      console.warn('⚠️ Could not read netlify.toml:', error.message);
      return null;
    }
  }

  readVercelConfig() {
    const vercelPath = join(this.projectPath, 'vercel.json');
    if (!existsSync(vercelPath)) return null;

    try {
      return JSON.parse(readFileSync(vercelPath, 'utf8'));
    } catch (error) {
      console.warn('⚠️ Could not read vercel.json:', error.message);
      return null;
    }
  }

  detectBuildTool(packageJson) {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const scripts = packageJson.scripts || {};

    // Vite Detection (Priority 1 - Current Stack)
    if (dependencies.vite || scripts.dev?.includes('vite')) {
      return {
        name: 'Vite',
        version: dependencies.vite?.replace('^', '') || 'latest'
      };
    }

    // Next.js Detection
    if (dependencies.next) {
      return {
        name: 'Next.js',
        version: dependencies.next.replace('^', '')
      };
    }

    // Webpack Detection
    if (dependencies.webpack || dependencies['@webpack/cli']) {
      return {
        name: 'Webpack',
        version: dependencies.webpack?.replace('^', '') || 'latest'
      };
    }

    // Create React App Detection
    if (dependencies['react-scripts']) {
      return {
        name: 'Create React App',
        version: dependencies['react-scripts'].replace('^', '')
      };
    }

    return { name: 'Unknown', version: 'latest' };
  }

  detectReactFeatures(dependencies) {
    const features = [];
    
    if (dependencies['@vitejs/plugin-react']) features.push('vite-integration');
    if (dependencies['react-router-dom']) features.push('routing');
    if (dependencies.zustand) features.push('state-management');
    if (dependencies['framer-motion']) features.push('animations');
    if (dependencies['@radix-ui/react-dropdown-menu']) features.push('component-library');
    
    return features;
  }

  detectConvexConfig() {
    const convexConfigPath = join(this.projectPath, 'convex.json');
    if (existsSync(convexConfigPath)) {
      try {
        return JSON.parse(readFileSync(convexConfigPath, 'utf8'));
      } catch {
        return null;
      }
    }
    return null;
  }

  detectNetlifyFeatures(netlifyConfig) {
    const features = [];
    
    if (netlifyConfig.functions) features.push('serverless-functions');
    if (netlifyConfig.redirects) features.push('redirects');
    if (netlifyConfig.headers) features.push('custom-headers');
    if (netlifyConfig.plugins) features.push('build-plugins');
    
    return features;
  }

  parseSimpleToml(content) {
    // Simple TOML parser for basic Netlify config
    const result = {};
    let currentSection = null;
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Section headers
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSection = trimmed.slice(1, -1);
        if (!result[currentSection]) result[currentSection] = {};
        continue;
      }
      
      // Key-value pairs
      const equals = trimmed.indexOf('=');
      if (equals > 0) {
        const key = trimmed.slice(0, equals).trim();
        const value = trimmed.slice(equals + 1).trim().replace(/"/g, '');
        
        if (currentSection) {
          result[currentSection][key] = value;
        } else {
          result[key] = value;
        }
      }
    }
    
    return result;
  }

  validateAndEnhanceStack(stack) {
    // Add confidence scores and enhance with derived information
    const enhanced = { ...stack };
    
    // Calculate overall confidence
    let totalConfidence = 0;
    let confidenceCount = 0;
    
    Object.values(stack).forEach(section => {
      if (section?.confidence) {
        totalConfidence += section.confidence;
        confidenceCount++;
      }
    });
    
    enhanced.overallConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
    
    // Add stack classification
    enhanced.classification = this.classifyStack(stack);
    
    // Add recommended MCPs based on stack
    enhanced.recommendedMCPs = this.getStackRecommendedMCPs(stack);
    
    return enhanced;
  }

  classifyStack(stack) {
    const classifications = [];
    
    if (stack.frontend?.framework === 'React') {
      classifications.push('modern-spa');
    }
    
    if (stack.backend?.websocket) {
      classifications.push('real-time');
    }
    
    if (stack.specializations?.medical) {
      classifications.push('healthcare');
    }
    
    if (stack.deployment?.platform) {
      classifications.push('cloud-native');
    }
    
    return classifications;
  }

  getStackRecommendedMCPs(stack) {
    const mcps = new Set();
    
    // Frontend MCPs
    if (stack.frontend?.framework === 'React') {
      mcps.add('storybook');
      if (stack.styling?.frameworks?.some(f => f.name === 'Tailwind CSS')) {
        mcps.add('tailwindcss');
      }
    }
    
    // Backend MCPs
    if (stack.backend?.service === 'Convex') {
      mcps.add('convex');
    } else if (stack.backend?.service === 'Supabase') {
      mcps.add('supabase-storage');
    }
    
    // Testing MCPs
    if (stack.testing?.frameworks?.some(f => f.name === 'Playwright')) {
      mcps.add('playwright');
    }
    if (stack.testing?.frameworks?.some(f => f.name === 'Storybook')) {
      mcps.add('storybook');
    }
    
    // Deployment MCPs
    if (stack.deployment?.platform === 'Netlify') {
      mcps.add('netlify');
    } else if (stack.deployment?.platform === 'Vercel') {
      mcps.add('vercel');
    }
    
    // Medical specialization MCPs
    if (stack.specializations?.medical) {
      mcps.add('accessibility');
      mcps.add('security');
    }
    
    return Array.from(mcps);
  }
}

/**
 * 🎯 Stack-Aware MCP Selection System
 */
export class StackAwareMCPSelector {
  constructor() {
    this.stackDetector = new StackDetectionSystem();
  }

  /**
   * 🤖 Select MCPs for agent based on detected stack
   */
  async selectMCPsForAgent(agentType, context = {}) {
    const stack = await this.stackDetector.detectProjectStack();
    const stackSpecificMCPs = this.getStackSpecificMCPs(agentType, stack);
    const contextEnhanced = this.enhanceWithContext(stackSpecificMCPs, context, stack);
    
    console.log(`🛠️ Selected MCPs for ${agentType}:`, contextEnhanced.slice(0, 5));
    
    return {
      mcps: contextEnhanced,
      stack: stack,
      focus: this.generateAgentFocus(agentType, stack),
      confidence: stack.overallConfidence
    };
  }

  getStackSpecificMCPs(agentType, stack) {
    const mcpMap = {
      'database-architecture': this.getDatabaseMCPs(stack),
      'frontend-development': this.getFrontendMCPs(stack),
      'devops-deployment': this.getDeploymentMCPs(stack),
      'testing-qa': this.getTestingMCPs(stack),
      'authentication-security': this.getSecurityMCPs(stack),
      'performance-optimization': this.getPerformanceMCPs(stack),
      'browser-automation': this.getBrowserMCPs(stack)
    };

    return mcpMap[agentType] || [];
  }

  getDatabaseMCPs(stack) {
    if (stack.backend?.service === 'Convex') {
      return ['convex', 'knowledge-graph-memory', 'appwrite'];
    } else if (stack.backend?.service === 'Supabase') {
      return ['supabase-storage', 'prisma', 'neon'];
    } else if (stack.backend?.service === 'Firebase') {
      return ['firebase', 'google-cloud'];
    }
    return ['prisma', 'neon', 'appwrite'];
  }

  getFrontendMCPs(stack) {
    const mcps = ['storybook'];
    
    if (stack.styling?.frameworks?.some(f => f.name === 'Tailwind CSS')) {
      mcps.push('tailwindcss');
    }
    
    if (stack.frontend?.buildTool === 'Vite') {
      mcps.push('figma', 'magicui');
    }
    
    return mcps;
  }

  getDeploymentMCPs(stack) {
    if (stack.deployment?.platform === 'Netlify') {
      return ['netlify', 'terraform', 'globalping'];
    } else if (stack.deployment?.platform === 'Vercel') {
      return ['vercel', 'terraform', 'globalping'];
    } else if (stack.deployment?.platform === 'AWS') {
      return ['aws-serverless', 'terraform', 'powertools-aws'];
    }
    return ['terraform', 'docker-hub', 'kubernetes'];
  }

  getTestingMCPs(stack) {
    const mcps = [];
    
    if (stack.testing?.frameworks?.some(f => f.name === 'Playwright')) {
      mcps.push('playwright');
    }
    
    if (stack.testing?.frameworks?.some(f => f.name === 'Storybook')) {
      mcps.push('storybook');
    }
    
    if (stack.testing?.frameworks?.some(f => f.name === 'Vitest')) {
      mcps.push('vitest');
    }
    
    mcps.push('lighthouse'); // Always include performance testing
    
    return mcps;
  }

  getSecurityMCPs(stack) {
    const mcps = ['auth0', 'snyk'];
    
    if (stack.specializations?.hipaa) {
      mcps.push('hashicorp-vault');
    }
    
    if (stack.deployment?.platform === 'AWS') {
      mcps.push('powertools-aws');
    }
    
    return mcps;
  }

  getPerformanceMCPs(stack) {
    const mcps = ['lighthouse', 'webpagetest'];
    
    if (stack.deployment?.platform === 'Netlify') {
      mcps.push('globalping');
    } else if (stack.deployment?.platform === 'AWS') {
      mcps.push('new-relic');
    }
    
    return mcps;
  }

  getBrowserMCPs(stack) {
    const mcps = [];
    
    if (stack.testing?.frameworks?.some(f => f.name === 'Playwright')) {
      mcps.push('playwright');
    } else {
      mcps.push('selenium');
    }
    
    mcps.push('puppeteer', 'browsertools');
    
    return mcps;
  }

  enhanceWithContext(mcps, context, stack) {
    let enhanced = [...mcps];
    
    // Medical education context
    if (stack.specializations?.medical || context.medical) {
      enhanced.push('accessibility', 'security');
    }
    
    // Production context
    if (context.production) {
      enhanced.push('monitoring', 'error-tracking');
    }
    
    // Remove duplicates and return top priority MCPs
    return [...new Set(enhanced)];
  }

  generateAgentFocus(agentType, stack) {
    const focusMap = {
      'database-architecture': `${stack.backend?.service || 'Database'} optimization and medical data modeling`,
      'frontend-development': `${stack.frontend?.framework || 'Frontend'} ${stack.frontend?.buildTool || ''} development with medical UI patterns`,
      'devops-deployment': `${stack.deployment?.platform || 'Cloud'} deployment with healthcare compliance`,
      'testing-qa': `${stack.testing?.frameworks?.map(f => f.name).join(' + ') || 'Comprehensive'} testing for medical applications`,
      'performance-optimization': `${stack.frontend?.framework || 'Application'} performance optimization for medical education`,
      'authentication-security': `Healthcare-grade security with ${stack.specializations?.hipaa ? 'HIPAA' : 'standard'} compliance`
    };

    return focusMap[agentType] || `${agentType} optimization for detected stack`;
  }
}

// Export for use in agent orchestration system
export { StackDetectionSystem as default };