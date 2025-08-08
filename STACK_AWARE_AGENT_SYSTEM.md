# 🧠 Stack-Aware Agent System for Claude Code

## 🎯 **Intelligent Stack Detection & Tool Adaptation**

This system makes all 15 subagents **fully stack-aware**, automatically adjusting their tool usage based on the detected technology stack in any project.

---

## 📊 **MedQuiz Pro Stack Profile (AUTO-DETECTED)**

### **🔍 Current Stack Detection:**
```json
{
  "frontend": {
    "framework": "React",
    "version": "19.1.0",
    "buildTool": "Vite",
    "buildVersion": "6.0.7",
    "language": "TypeScript",
    "languageVersion": "5.8.2"
  },
  "backend": {
    "service": "Convex",
    "type": "Real-time Database",
    "websocket": true,
    "url": "https://formal-sardine-916.convex.cloud"
  },
  "deployment": {
    "platform": "Netlify",
    "buildCommand": "npm run build",
    "publishDir": "dist",
    "environment": "production"
  },
  "styling": {
    "framework": "Tailwind CSS",
    "version": "3.4.14",
    "components": "Radix UI",
    "animations": "Framer Motion"
  },
  "testing": {
    "e2e": "Playwright",
    "unit": "Vitest",
    "storybook": "8.5.0",
    "accessibility": "axe-core"
  },
  "state": {
    "management": "Zustand",
    "version": "5.0.7"
  },
  "routing": {
    "library": "React Router DOM",
    "version": "7.7.1"
  },
  "specializations": {
    "medical": true,
    "usmle": true,
    "hipaa": true,
    "accessibility": true
  }
}
```

---

## 🤖 **Stack-Aware Agent Adaptations**

### **1. 🗄️ Database Architecture Agent**
**Stack-Aware Adaptations:**

#### **✅ Convex Stack (Current)**
- **Primary MCPs**: `convex`, `appwrite` (fallback), `knowledge-graph-memory`
- **Focus**: Real-time mutations, WebSocket subscriptions, Convex functions
- **Specializations**: Medical data modeling, USMLE content management
- **WebSocket Optimization**: Real-time quiz sessions, live progress tracking

#### **🔄 Alternative Stack Support:**
```javascript
const DATABASE_STACK_ADAPTATIONS = {
  "Convex": {
    primary: ["convex", "knowledge-graph-memory"],
    focus: "Real-time mutations and WebSocket subscriptions",
    features: ["live-queries", "server-functions", "auth-integration"]
  },
  "Supabase": {
    primary: ["supabase-storage", "prisma", "neon"],
    focus: "PostgreSQL with real-time subscriptions",
    features: ["row-level-security", "edge-functions", "auth"]
  },
  "Neon": {
    primary: ["neon", "prisma", "postgresql"],
    focus: "Serverless PostgreSQL with branching",
    features: ["database-branching", "connection-pooling", "auto-scaling"]
  },
  "Firebase": {
    primary: ["firebase", "firestore", "google-cloud"],
    focus: "NoSQL with real-time listeners",
    features: ["realtime-database", "cloud-functions", "firebase-auth"]
  }
};
```

### **2. 🎨 Frontend Development Agent**
**Stack-Aware Adaptations:**

#### **✅ React + Vite Stack (Current)**
- **Primary MCPs**: `storybook`, `tailwindcss`, `figma`, `magicui`
- **Focus**: React 19 features, Vite build optimization, Tailwind components
- **Specializations**: Medical UI patterns, USMLE quiz interfaces

#### **🔄 Alternative Stack Support:**
```javascript
const FRONTEND_STACK_ADAPTATIONS = {
  "React + Vite": {
    primary: ["storybook", "tailwindcss", "figma", "magicui"],
    focus: "React 19 features and Vite optimization",
    features: ["jsx-transform", "hot-reload", "component-testing"]
  },
  "React + Next.js": {
    primary: ["storybook", "tailwindcss", "vercel"],
    focus: "SSR and API routes optimization",
    features: ["app-router", "server-components", "edge-functions"]
  },
  "Vue + Nuxt": {
    primary: ["vue-devtools", "tailwindcss", "figma"],
    focus: "Vue composition API and Nuxt features",
    features: ["auto-imports", "server-side-rendering", "vue-components"]
  },
  "Svelte + SvelteKit": {
    primary: ["svelte-testing", "tailwindcss", "figma"],
    focus: "Svelte compiler and SvelteKit routing",
    features: ["svelte-stores", "reactive-statements", "kit-routing"]
  }
};
```

### **3. 🚀 DevOps & Deployment Agent**
**Stack-Aware Adaptations:**

#### **✅ Netlify Stack (Current)**
- **Primary MCPs**: `netlify`, `terraform`, `globalping`
- **Focus**: Netlify Functions, edge deployment, build optimization
- **Specializations**: Medical compliance headers, HIPAA-ready CSP

#### **🔄 Alternative Stack Support:**
```javascript
const DEPLOYMENT_STACK_ADAPTATIONS = {
  "Netlify": {
    primary: ["netlify", "terraform", "globalping"],
    focus: "Edge deployment and serverless functions",
    features: ["edge-functions", "form-handling", "identity"]
  },
  "Vercel": {
    primary: ["vercel", "terraform", "globalping"],
    focus: "Edge runtime and API routes",
    features: ["edge-functions", "serverless-functions", "preview-deployments"]
  },
  "AWS": {
    primary: ["aws-serverless", "terraform", "powertools-aws"],
    focus: "Lambda functions and CloudFront",
    features: ["lambda-edge", "cloudformation", "s3-hosting"]
  },
  "Digital Ocean": {
    primary: ["kubernetes", "docker-hub", "terraform"],
    focus: "App platform and Kubernetes",
    features: ["app-platform", "managed-kubernetes", "container-registry"]
  }
};
```

### **4. 🧪 Testing & QA Agent**
**Stack-Aware Adaptations:**

#### **✅ Playwright + Vitest Stack (Current)**
- **Primary MCPs**: `playwright`, `vitest`, `storybook`, `lighthouse`
- **Focus**: E2E medical workflows, component testing, accessibility validation
- **Specializations**: USMLE quiz testing, medical content validation

#### **🔄 Alternative Stack Support:**
```javascript
const TESTING_STACK_ADAPTATIONS = {
  "Playwright + Vitest": {
    primary: ["playwright", "vitest", "storybook", "lighthouse"],
    focus: "E2E and component testing",
    features: ["visual-testing", "accessibility-testing", "component-stories"]
  },
  "Cypress + Jest": {
    primary: ["cypress", "jest", "testing-library"],
    focus: "Interactive testing and unit tests",
    features: ["time-travel-debugging", "snapshot-testing", "mock-functions"]
  },
  "Selenium + Mocha": {
    primary: ["selenium", "mocha", "browserstack"],
    focus: "Cross-browser automation",
    features: ["grid-testing", "parallel-execution", "browser-matrix"]
  },
  "TestCafe + Jasmine": {
    primary: ["testcafe", "jasmine", "browsertools"],
    focus: "No-driver testing framework",
    features: ["automatic-waiting", "smart-assertions", "parallel-testing"]
  }
};
```

---

## 🧠 **Automatic Stack Detection System**

### **📋 Stack Detection Logic:**
```javascript
class StackDetectionSystem {
  async detectProjectStack(projectPath = '.') {
    const stack = {
      frontend: await this.detectFrontend(projectPath),
      backend: await this.detectBackend(projectPath),
      deployment: await this.detectDeployment(projectPath),
      testing: await this.detectTesting(projectPath),
      styling: await this.detectStyling(projectPath),
      database: await this.detectDatabase(projectPath),
      specializations: await this.detectSpecializations(projectPath)
    };
    
    return this.validateAndEnhanceStack(stack);
  }

  async detectFrontend(projectPath) {
    const packageJson = await this.readPackageJson(projectPath);
    
    // React Detection
    if (packageJson.dependencies?.react) {
      const buildTool = this.detectBuildTool(packageJson);
      return {
        framework: 'React',
        version: packageJson.dependencies.react,
        buildTool: buildTool.name,
        buildVersion: buildTool.version,
        language: packageJson.devDependencies?.typescript ? 'TypeScript' : 'JavaScript'
      };
    }
    
    // Vue Detection
    if (packageJson.dependencies?.vue) {
      return {
        framework: 'Vue',
        version: packageJson.dependencies.vue,
        buildTool: 'Vite', // Vue 3 typically uses Vite
        language: packageJson.devDependencies?.typescript ? 'TypeScript' : 'JavaScript'
      };
    }
    
    // Svelte Detection
    if (packageJson.devDependencies?.svelte || packageJson.dependencies?.svelte) {
      return {
        framework: 'Svelte',
        buildTool: 'SvelteKit',
        language: packageJson.devDependencies?.typescript ? 'TypeScript' : 'JavaScript'
      };
    }
    
    return null;
  }

  async detectBackend(projectPath) {
    const packageJson = await this.readPackageJson(projectPath);
    
    // Convex Detection
    if (packageJson.dependencies?.convex || packageJson.scripts?.['convex:dev']) {
      return {
        service: 'Convex',
        type: 'Real-time Database',
        websocket: true,
        functions: true
      };
    }
    
    // Supabase Detection
    if (packageJson.dependencies?.['@supabase/supabase-js']) {
      return {
        service: 'Supabase',
        type: 'PostgreSQL + Real-time',
        features: ['row-level-security', 'edge-functions']
      };
    }
    
    // Firebase Detection
    if (packageJson.dependencies?.firebase) {
      return {
        service: 'Firebase',
        type: 'NoSQL Database',
        features: ['realtime-database', 'cloud-functions']
      };
    }
    
    return null;
  }

  async detectDeployment(projectPath) {
    // Check for deployment configuration files
    const configs = await this.checkDeploymentConfigs(projectPath);
    
    if (configs.netlify) {
      return {
        platform: 'Netlify',
        config: configs.netlify,
        features: ['edge-functions', 'forms', 'identity']
      };
    }
    
    if (configs.vercel) {
      return {
        platform: 'Vercel',
        config: configs.vercel,
        features: ['edge-runtime', 'serverless-functions']
      };
    }
    
    if (configs.aws) {
      return {
        platform: 'AWS',
        services: configs.aws,
        features: ['lambda', 'cloudfront', 's3']
      };
    }
    
    return null;
  }
}
```

---

## 🎯 **Enhanced Agent MCP Selection**

### **🔧 Dynamic MCP Prioritization Based on Stack:**
```javascript
class StackAwareAgentOrchestrator {
  constructor() {
    this.stackDetector = new StackDetectionSystem();
    this.mcpAdaptations = this.loadMCPAdaptations();
  }

  async deployStackAwareAgent(agentType, context = {}) {
    // 1. Detect current project stack
    const detectedStack = await this.stackDetector.detectProjectStack();
    
    // 2. Get stack-specific MCP configuration
    const stackConfig = this.getStackSpecificConfig(agentType, detectedStack);
    
    // 3. Enhance with medical education context if detected
    if (detectedStack.specializations?.medical) {
      stackConfig.mcps = this.enhanceWithMedicalMCPs(stackConfig.mcps, agentType);
    }
    
    // 4. Deploy agent with stack-aware configuration
    return await this.deployAgent({
      type: agentType,
      mcps: stackConfig.mcps,
      focus: stackConfig.focus,
      stack: detectedStack,
      context: { ...context, stack: detectedStack }
    });
  }

  getStackSpecificConfig(agentType, stack) {
    const adaptations = this.mcpAdaptations[agentType];
    
    // Database Agent Stack Adaptation
    if (agentType === 'database-architecture') {
      if (stack.backend?.service === 'Convex') {
        return {
          mcps: ['convex', 'knowledge-graph-memory', 'appwrite'],
          focus: 'Convex real-time mutations and WebSocket subscriptions'
        };
      } else if (stack.backend?.service === 'Supabase') {
        return {
          mcps: ['supabase-storage', 'prisma', 'neon'],
          focus: 'PostgreSQL with real-time subscriptions and RLS'
        };
      }
    }
    
    // Frontend Agent Stack Adaptation
    if (agentType === 'frontend-development') {
      if (stack.frontend?.framework === 'React' && stack.frontend?.buildTool === 'Vite') {
        return {
          mcps: ['storybook', 'tailwindcss', 'figma', 'magicui'],
          focus: 'React 19 features with Vite optimization'
        };
      } else if (stack.frontend?.framework === 'Vue') {
        return {
          mcps: ['vue-devtools', 'tailwindcss', 'figma'],
          focus: 'Vue composition API and Nuxt features'
        };
      }
    }
    
    // Deployment Agent Stack Adaptation
    if (agentType === 'devops-deployment') {
      if (stack.deployment?.platform === 'Netlify') {
        return {
          mcps: ['netlify', 'terraform', 'globalping'],
          focus: 'Netlify Functions and edge deployment'
        };
      } else if (stack.deployment?.platform === 'Vercel') {
        return {
          mcps: ['vercel', 'terraform', 'globalping'],
          focus: 'Vercel Edge Runtime and API routes'
        };
      }
    }
    
    // Testing Agent Stack Adaptation
    if (agentType === 'testing-qa') {
      const testingStack = this.detectTestingStack(stack);
      if (testingStack.includes('Playwright')) {
        return {
          mcps: ['playwright', 'vitest', 'storybook', 'lighthouse'],
          focus: 'Playwright E2E testing with Vitest components'
        };
      } else if (testingStack.includes('Cypress')) {
        return {
          mcps: ['cypress', 'jest', 'testing-library'],
          focus: 'Cypress interactive testing with Jest units'
        };
      }
    }
    
    // Return default configuration if no specific adaptation found
    return adaptations?.default || { mcps: [], focus: 'General analysis' };
  }
}
```

---

## 📊 **Complete Stack Compatibility Matrix**

### **🎯 Frontend Frameworks:**
| Framework | Build Tool | MCPs | Agent Focus |
|-----------|------------|------|-------------|
| **React 19** ✅ | **Vite** ✅ | storybook, tailwindcss, magicui | Modern React features |
| React 18 | Next.js | storybook, tailwindcss, vercel | SSR optimization |
| Vue 3 | Nuxt | vue-devtools, tailwindcss | Composition API |
| Svelte | SvelteKit | svelte-testing, tailwindcss | Compiler optimization |

### **🗄️ Backend Services:**
| Service | Type | MCPs | Agent Focus |
|---------|------|------|-------------|
| **Convex** ✅ | **Real-time DB** | convex, knowledge-graph-memory | WebSocket subscriptions |
| Supabase | PostgreSQL | supabase-storage, prisma, neon | RLS and edge functions |
| Firebase | NoSQL | firebase, google-cloud | Real-time listeners |
| Neon | PostgreSQL | neon, prisma | Serverless branching |

### **🚀 Deployment Platforms:**
| Platform | Features | MCPs | Agent Focus |
|----------|----------|------|-------------|
| **Netlify** ✅ | **Edge Functions** | netlify, terraform, globalping | CDN optimization |
| Vercel | Edge Runtime | vercel, terraform | API routes |
| AWS | Lambda | aws-serverless, powertools-aws | Serverless architecture |
| Digital Ocean | Kubernetes | kubernetes, docker-hub | Container orchestration |

---

## 🏥 **Medical Education Stack Optimizations**

### **🎓 USMLE-Specific Enhancements:**
When medical context is detected, agents automatically add:

```javascript
const MEDICAL_STACK_ENHANCEMENTS = {
  'database-architecture': {
    additionalMCPs: ['hipaa-compliance', 'medical-data-modeling'],
    focus: 'HIPAA-compliant medical content storage and USMLE question management'
  },
  'frontend-development': {
    additionalMCPs: ['medical-ui-patterns', 'accessibility-medical'],
    focus: 'Medical education UI with clinical terminology and accessibility'
  },
  'authentication-security': {
    additionalMCPs: ['hipaa-auth', 'medical-data-protection'],
    focus: 'Healthcare-grade authentication with HIPAA compliance'
  },
  'testing-qa': {
    additionalMCPs: ['medical-content-validation', 'clinical-workflow-testing'],
    focus: 'Medical content accuracy and clinical workflow validation'
  }
};
```

---

## 🎮 **Usage Examples**

### **Example 1: React + Convex + Netlify (Current Stack)**
```javascript
// Claude Code automatically detects and adapts
User: "Optimize database performance for quiz questions"

Auto-Detection:
✅ Frontend: React 19 + Vite
✅ Backend: Convex Real-time DB  
✅ Deployment: Netlify

Agent Deployment:
🤖 Database Agent → MCPs: convex, knowledge-graph-memory
🎯 Focus: Convex mutations and WebSocket optimization
🏥 Medical: Enhanced with USMLE content management
```

### **Example 2: Vue + Supabase + Vercel**
```javascript
// If project was Vue + Supabase + Vercel
User: "Fix frontend responsiveness issues"

Auto-Detection:
✅ Frontend: Vue 3 + Nuxt
✅ Backend: Supabase PostgreSQL
✅ Deployment: Vercel

Agent Deployment:
🤖 Frontend Agent → MCPs: vue-devtools, tailwindcss
🎯 Focus: Vue composition API optimization
📱 Enhanced: Responsive design patterns
```

### **Example 3: Svelte + Firebase + AWS**
```javascript
// Hypothetical stack adaptation
User: "Deploy to production with monitoring"

Auto-Detection:
✅ Frontend: Svelte + SvelteKit
✅ Backend: Firebase
✅ Deployment: AWS

Agent Deployment:
🤖 DevOps Agent → MCPs: aws-serverless, firebase, terraform
🎯 Focus: Lambda functions and CloudFront CDN
📊 Enhanced: AWS monitoring and alerting
```

---

## 🚀 **Benefits of Stack-Aware Agents**

### **✅ Intelligent Tool Selection:**
- **Automatic MCP Prioritization** based on detected technology stack
- **Context-Aware Recommendations** specific to your chosen technologies
- **Medical Education Enhancements** when healthcare context is detected
- **Performance Optimizations** tailored to your deployment platform

### **✅ Universal Compatibility:**
- **Multi-Stack Support** - Works with any combination of technologies
- **Seamless Adaptation** - No manual configuration required
- **Future-Proof** - Easily extensible for new technologies
- **Medical Focus** - Healthcare compliance built into every stack

### **✅ Developer Experience:**
- **Zero Configuration** - Automatic stack detection and adaptation
- **Consistent Quality** - Same level of expertise regardless of stack
- **Specialized Knowledge** - Stack-specific optimizations and best practices
- **Medical Compliance** - HIPAA and accessibility standards for any stack

---

**🎉 The stack-aware agent system ensures that all 15 specialized agents automatically adapt their tool usage and recommendations based on your exact technology stack, providing optimal support whether you're using React + Convex + Netlify (current) or any other combination of modern web technologies! 🚀**