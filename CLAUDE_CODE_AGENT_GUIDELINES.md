# 🤖 Claude Code Agent Deployment Guidelines

## 🎯 **Quick Reference for Claude Code**

This guide enables Claude Code to automatically deploy the right specialized agents for any development or testing scenario.

---

## 🚨 **CRITICAL: Auto-Deploy Triggers**

### **When Claude Code Should IMMEDIATELY Deploy Agents:**

```javascript
// AUTOMATIC DEPLOYMENT PATTERNS
const DEPLOY_TRIGGERS = {
  // User says these words → Deploy these agents
  'accessibility': ['Accessibility', 'Testing', 'Browser'],
  'performance': ['Performance', 'Infrastructure', 'Browser'],
  'mobile': ['Browser', 'Performance', 'Frontend'],
  'bug': ['Testing', 'Code Quality', 'Performance'],
  'security': ['Security', 'Infrastructure', 'Code Quality'],
  'database': ['Database', 'API', 'E2E Testing'],
  'ui': ['Frontend', 'Accessibility', 'Browser'],
  'api': ['API', 'Database', 'E2E Testing'],
  'test': ['Testing', 'E2E Testing', 'Browser'],
  'deploy': ['DevOps', 'Performance', 'Security'],
  'comprehensive': 'ALL_AGENTS' // Deploy all 15 agents
};
```

---

## ⚡ **Instant Agent Deployment Commands**

### **Single Agent Deployment:**
```javascript
// Deploy when user mentions specific needs
if (userInput.includes('accessibility')) {
  await deployAgent('Accessibility', {
    mcps: ['playwright-accessibility', 'lighthouse', 'storybook'],
    focus: 'WCAG 2.1 AA compliance for medical education',
    deliverables: ['Accessibility audit', 'WCAG compliance report', 'Remediation recommendations']
  });
}
```

### **Multi-Agent Deployment:**
```javascript
// Deploy multiple agents for comprehensive tasks
if (userInput.includes('comprehensive test') || userInput.includes('full audit')) {
  await deployAgents([
    'Accessibility', 'Frontend', 'E2E Testing', 
    'Performance', 'Browser'
  ], {
    parallel: true,
    priority: 'comprehensive_validation',
    focus: 'Production readiness assessment'
  });
}
```

---

## 🎮 **Context-Aware Agent Selection**

### **Medical Education Context Detection:**
```javascript
const MEDICAL_CONTEXT_TRIGGERS = [
  'usmle', 'medical', 'healthcare', 'clinical', 'patient',
  'medical student', 'doctor', 'physician', 'hospital'
];

// Enhance agents with medical-specific MCPs
if (containsMedicalContext(userInput)) {
  enhanceAgentsWithMedicalMCPs();
}
```

### **Development Phase Detection:**
```javascript
const PHASE_DETECTION = {
  'development': ['Frontend', 'Database', 'Code Quality'],
  'testing': ['Testing', 'E2E Testing', 'Browser', 'Performance'],
  'production': ['DevOps', 'Security', 'Performance', 'Monitoring'],
  'debugging': ['Testing', 'Code Quality', 'Performance'],
  'optimization': ['Performance', 'Code Quality', 'Infrastructure']
};
```

---

## 🛠️ **MCP Tool Prioritization by Agent**

### **🗄️ Database Architecture Agent**
```javascript
const DATABASE_MCPS = {
  primary: ['appwrite', 'neon', 'prisma'],      // Use these first
  secondary: ['hasura', 'fauna', 'supabase-storage'], // Use for advanced features
  medical: ['appwrite', 'neon']                  // Optimized for medical data
};
```

### **🎨 Frontend Development Agent**
```javascript
const FRONTEND_MCPS = {
  primary: ['storybook', 'figma', 'tailwindcss'],
  secondary: ['chromatic', 'lighthouse', 'shadcn-ui'],
  medical: ['storybook', 'lighthouse']           // Medical UI focus
};
```

### **🔐 Authentication & Security Agent**
```javascript
const SECURITY_MCPS = {
  primary: ['auth0', 'snyk', 'okta'],
  secondary: ['cloudflare-access', 'hashicorp-vault'],
  medical: ['auth0', 'snyk']                     // HIPAA compliance focus
};
```

### **🧪 Testing & QA Agent**
```javascript
const TESTING_MCPS = {
  primary: ['playwright', 'cypress', 'percy'],
  secondary: ['testcafe', 'browserstack'],
  medical: ['playwright', 'lighthouse']          // Medical workflow testing
};
```

### **⚡ Performance Optimization Agent**
```javascript
const PERFORMANCE_MCPS = {
  primary: ['lighthouse', 'new-relic', 'webpagetest'],
  secondary: ['cloudflare-analytics', 'datadog'],
  medical: ['lighthouse', 'webpagetest']         // Medical app performance
};
```

---

## 🤖 **Claude Code Integration Examples**

### **Example 1: Accessibility Request**
```
User: "Check if our app is accessible to medical students with disabilities"

Claude Code Auto-Response:
1. Detect: 'accessible' + 'medical students' → Deploy Accessibility Agent
2. MCPs: playwright-accessibility, lighthouse, storybook
3. Focus: WCAG 2.1 AA + medical education context
4. Deliverables: Comprehensive accessibility audit with medical-specific recommendations
```

### **Example 2: Performance Issue**
```
User: "The quiz loading is slow on mobile"

Claude Code Auto-Response:
1. Detect: 'slow' + 'mobile' + 'quiz' → Deploy Performance + Browser agents
2. MCPs: lighthouse, webpagetest, playwright (mobile testing)
3. Focus: Mobile performance optimization for medical education
4. Deliverables: Performance audit + mobile optimization recommendations
```

### **Example 3: Comprehensive Testing**
```
User: "Run all tests before production deployment"

Claude Code Auto-Response:
1. Detect: 'all tests' + 'production' → Deploy ALL agents
2. MCPs: All priority MCPs across 15 agent domains
3. Focus: Production readiness validation
4. Deliverables: Complete testing matrix with deployment approval
```

---

## 📊 **Agent Deployment Decision Matrix**

### **🎯 Single Issue (Deploy 1-2 Agents):**
- Specific bug → Testing + Code Quality
- UI problem → Frontend + Accessibility  
- Performance issue → Performance + Infrastructure
- Security concern → Security + Infrastructure

### **🔄 Feature Development (Deploy 3-5 Agents):**
- New feature → Frontend + Database + Testing + Performance
- Major update → Frontend + Database + Testing + Security + Performance

### **🚀 Production Deployment (Deploy 8-15 Agents):**
- Pre-deployment → Testing + Performance + Security + Browser + DevOps
- Comprehensive audit → ALL agents for complete validation

---

## ⚡ **Instant Deployment Patterns**

### **Pattern 1: Problem-Solving Mode**
```javascript
// User reports an issue
function deployForProblem(issueType) {
  const agentMap = {
    'accessibility': ['Accessibility', 'Testing'],
    'performance': ['Performance', 'Infrastructure'],
    'security': ['Security', 'Infrastructure'],
    'ui': ['Frontend', 'Browser'],
    'database': ['Database', 'API'],
    'api': ['API', 'E2E Testing']
  };
  
  return deployAgents(agentMap[issueType]);
}
```

### **Pattern 2: Development Mode**
```javascript
// User wants to build something
function deployForDevelopment(featureType) {
  const baseAgents = ['Frontend', 'Database', 'Testing'];
  
  if (featureType.includes('medical')) {
    baseAgents.push('Accessibility', 'Security');
  }
  
  if (featureType.includes('complex')) {
    baseAgents.push('Performance', 'E2E Testing');
  }
  
  return deployAgents(baseAgents);
}
```

### **Pattern 3: Validation Mode**
```javascript
// User wants comprehensive testing
function deployForValidation(scope) {
  if (scope === 'comprehensive') {
    return deployAllAgents();
  }
  
  return deployAgents([
    'Testing', 'Performance', 'Accessibility', 
    'Security', 'Browser'
  ]);
}
```

---

## 🎯 **Medical Education Specific Enhancements**

### **USMLE Platform Optimization:**
```javascript
const MEDICAL_ENHANCEMENTS = {
  'quiz_performance': ['Performance', 'Browser', 'Testing'],
  'medical_content': ['Accessibility', 'Frontend', 'Testing'],
  'student_workflow': ['E2E Testing', 'Browser', 'Performance'],
  'clinical_accuracy': ['Testing', 'Code Quality', 'Security'],
  'mobile_studying': ['Browser', 'Performance', 'Frontend']
};
```

### **Healthcare Compliance:**
```javascript
const COMPLIANCE_AGENTS = {
  'hipaa': ['Security', 'Infrastructure', 'Code Quality'],
  'accessibility': ['Accessibility', 'Testing', 'Browser'],
  'performance': ['Performance', 'Infrastructure', 'Monitoring']
};
```

---

## 🚀 **Production Deployment Checklist**

### **Pre-Deployment (Auto-Deploy These Agents):**
```javascript
const PRE_DEPLOYMENT_AGENTS = [
  'Testing',           // Ensure all tests pass
  'Performance',       // Validate loading times
  'Security',          // Check vulnerabilities  
  'Accessibility',     // WCAG compliance
  'Browser',          // Cross-browser testing
  'E2E Testing',      // Complete user journeys
  'Code Quality'      // Final code review
];
```

### **Post-Deployment (Auto-Deploy These Agents):**
```javascript
const POST_DEPLOYMENT_AGENTS = [
  'Performance',       // Monitor real performance
  'Infrastructure',    // Check deployment health
  'Monitoring',        // Track user behavior
  'Security'          // Ongoing security monitoring
];
```

---

## 🎉 **Quick Start for Claude Code**

### **Step 1: Detect Context**
```javascript
const userContext = analyzeUserInput(userMessage);
const requiredAgents = selectAgents(userContext);
```

### **Step 2: Deploy Agents**
```javascript
const results = await deployAgents(requiredAgents, {
  mcps: getPriorityMCPs(requiredAgents),
  parallel: true,
  focus: userContext.focus
});
```

### **Step 3: Aggregate Results**
```javascript
const summary = aggregateAgentResults(results);
return formatComprehensiveReport(summary);
```

---

**🤖 This guide enables Claude Code to become an intelligent orchestrator of specialized agents, automatically deploying the right expertise for any development, testing, or optimization scenario in the MedQuiz Pro medical education platform! 🏥✨**