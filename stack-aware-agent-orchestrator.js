/**
 * 🧠 Stack-Aware Agent Orchestration System
 * Automatically deploys agents with stack-specific MCP selection and medical education optimization
 */

import { StackDetectionSystem, StackAwareMCPSelector } from './stack-detection-system.js';
import { readFileSync } from 'fs';

export class StackAwareAgentOrchestrator {
  constructor() {
    this.stackDetector = new StackDetectionSystem();
    this.mcpSelector = new StackAwareMCPSelector();
    this.deploymentHistory = [];
    this.currentStack = null;
  }

  /**
   * 🎯 Main entry point for Claude Code - Stack-aware agent deployment
   */
  async deployStackAwareAgents(userInput, context = {}) {
    console.log('🤖 Starting stack-aware agent deployment...');

    // 1. Detect project stack (cached after first detection)
    if (!this.currentStack) {
      this.currentStack = await this.stackDetector.detectProjectStack();
      console.log(`✅ Detected stack: ${this.currentStack.frontend?.framework} + ${this.currentStack.backend?.service} + ${this.currentStack.deployment?.platform}`);
    }

    // 2. Analyze user input with stack context
    const analysis = this.analyzeUserInputWithStack(userInput, this.currentStack);
    
    // 3. Select appropriate agents based on analysis and stack
    const selectedAgents = this.selectStackAwareAgents(analysis);
    
    // 4. Create stack-aware deployment plan
    const deploymentPlan = await this.createStackAwareDeploymentPlan(selectedAgents, analysis);
    
    // 5. Execute deployment with stack-specific configurations
    console.log(`🚀 Deploying ${deploymentPlan.agents.length} stack-aware agents...`);
    const results = await this.executeStackAwareDeployment(deploymentPlan);
    
    // 6. Aggregate results with stack context
    return this.aggregateStackAwareResults(results, analysis, this.currentStack);
  }

  /**
   * 🧠 Analyze user input with stack awareness
   */
  analyzeUserInputWithStack(input, stack) {
    const baseAnalysis = {
      intent: this.detectIntent(input),
      context: this.detectContext(input),
      urgency: this.detectUrgency(input),
      scope: this.detectScope(input),
      medical: this.detectMedicalContext(input),
      triggers: this.detectTriggers(input)
    };

    // Enhance analysis with stack-specific context
    const stackEnhanced = {
      ...baseAnalysis,
      stack: {
        frontend: stack.frontend,
        backend: stack.backend,
        deployment: stack.deployment,
        specializations: stack.specializations,
        confidence: stack.overallConfidence
      },
      stackSpecific: this.detectStackSpecificNeeds(input, stack)
    };

    console.log(`🧠 Stack-aware analysis:`, {
      intent: stackEnhanced.intent,
      stack: `${stack.frontend?.framework}+${stack.backend?.service}+${stack.deployment?.platform}`,
      medical: stackEnhanced.medical,
      stackSpecific: stackEnhanced.stackSpecific
    });

    return stackEnhanced;
  }

  /**
   * 🔍 Detect stack-specific needs from user input
   */
  detectStackSpecificNeeds(input, stack) {
    const needs = [];

    // React-specific needs
    if (stack.frontend?.framework === 'React' && input.toLowerCase().includes('component')) {
      needs.push('react-component-optimization');
    }

    // Convex-specific needs
    if (stack.backend?.service === 'Convex' && (input.includes('real-time') || input.includes('websocket'))) {
      needs.push('convex-realtime-optimization');
    }

    // Netlify-specific needs
    if (stack.deployment?.platform === 'Netlify' && (input.includes('deploy') || input.includes('build'))) {
      needs.push('netlify-deployment-optimization');
    }

    // Vite-specific needs
    if (stack.frontend?.buildTool === 'Vite' && input.includes('slow')) {
      needs.push('vite-build-optimization');
    }

    // Medical-specific needs
    if (stack.specializations?.medical && (input.includes('accessibility') || input.includes('usmle'))) {
      needs.push('medical-education-optimization');
    }

    return needs;
  }

  /**
   * 🤖 Select agents based on stack analysis
   */
  selectStackAwareAgents(analysis) {
    let selectedAgents = [];

    // Handle comprehensive requests
    if (analysis.intent === 'comprehensive' || analysis.scope === 'comprehensive') {
      return this.getAllAgentTypes();
    }

    // Stack-specific agent selection
    const stackBasedAgents = this.getStackBasedAgents(analysis);
    selectedAgents = selectedAgents.concat(stackBasedAgents);

    // Intent-based agent selection (enhanced with stack context)
    const intentBasedAgents = this.getIntentBasedAgents(analysis);
    selectedAgents = selectedAgents.concat(intentBasedAgents);

    // Medical education specific agents
    if (analysis.medical || analysis.stack.specializations?.medical) {
      selectedAgents = selectedAgents.concat([
        'authentication-security', // HIPAA compliance
        'testing-qa',              // Medical content validation
        'performance-optimization' // Clinical environment performance
      ]);
    }

    // Stack-specific need agents
    if (analysis.stackSpecific.includes('convex-realtime-optimization')) {
      selectedAgents.push('database-architecture', 'performance-optimization');
    }

    if (analysis.stackSpecific.includes('netlify-deployment-optimization')) {
      selectedAgents.push('devops-deployment', 'performance-optimization');
    }

    return [...new Set(selectedAgents)];
  }

  /**
   * 🏗️ Get agents based on detected stack
   */
  getStackBasedAgents(analysis) {
    const agents = [];
    const stack = analysis.stack;

    // Frontend stack agents
    if (stack.frontend?.framework === 'React') {
      agents.push('frontend-development');
      
      if (stack.frontend.buildTool === 'Vite') {
        agents.push('performance-optimization'); // Vite build optimization
      }
    }

    // Backend stack agents  
    if (stack.backend?.service === 'Convex') {
      agents.push('database-architecture');
      
      if (stack.backend.websocket) {
        agents.push('api-integration'); // WebSocket optimization
      }
    }

    // Deployment stack agents
    if (stack.deployment?.platform === 'Netlify') {
      agents.push('devops-deployment');
    }

    // Testing stack agents
    if (stack.specializations?.accessibility) {
      agents.push('testing-qa');
    }

    return agents;
  }

  /**
   * 📋 Create stack-aware deployment plan
   */
  async createStackAwareDeploymentPlan(agents, analysis) {
    const deploymentPlan = {
      parallel: analysis.urgency !== 'high',
      stack: analysis.stack,
      agents: []
    };

    // Create stack-aware agent configurations
    for (const agentType of agents) {
      const stackAwareMCPs = await this.mcpSelector.selectMCPsForAgent(agentType, {
        medical: analysis.medical,
        production: analysis.intent === 'deploy',
        stack: analysis.stack
      });

      deploymentPlan.agents.push({
        type: agentType,
        mcps: stackAwareMCPs.mcps,
        focus: stackAwareMCPs.focus,
        priority: this.calculateStackAwarePriority(agentType, analysis),
        config: {
          stack: analysis.stack,
          medical: analysis.medical,
          urgency: analysis.urgency,
          stackSpecific: analysis.stackSpecific,
          confidence: stackAwareMCPs.confidence
        }
      });
    }

    // Sort by priority (stack-specific prioritization)
    deploymentPlan.agents.sort((a, b) => b.priority - a.priority);

    console.log(`📋 Stack-aware deployment plan created:`, {
      agents: deploymentPlan.agents.length,
      stack: `${analysis.stack.frontend?.framework}+${analysis.stack.backend?.service}`,
      parallel: deploymentPlan.parallel
    });

    return deploymentPlan;
  }

  /**
   * ⚡ Calculate stack-aware priority
   */
  calculateStackAwarePriority(agentType, analysis) {
    let priority = 5; // Base priority

    // Stack-specific priority boosts
    const stack = analysis.stack;

    // Frontend agents get priority for React stack
    if (agentType === 'frontend-development' && stack.frontend?.framework === 'React') {
      priority += 2;
    }

    // Database agents get priority for Convex stack
    if (agentType === 'database-architecture' && stack.backend?.service === 'Convex') {
      priority += 2;
    }

    // Deployment agents get priority for Netlify stack
    if (agentType === 'devops-deployment' && stack.deployment?.platform === 'Netlify') {
      priority += 2;
    }

    // Medical context priority
    if (analysis.medical && stack.specializations?.medical) {
      if (['authentication-security', 'testing-qa', 'performance-optimization'].includes(agentType)) {
        priority += 3;
      }
    }

    // Urgency and intent modifiers
    if (analysis.urgency === 'high') priority += 3;
    if (analysis.intent === 'deploy') priority += 2;
    if (analysis.scope === 'comprehensive') priority += 1;

    return priority;
  }

  /**
   * 🚀 Execute stack-aware deployment
   */
  async executeStackAwareDeployment(deploymentPlan) {
    const results = [];

    if (deploymentPlan.parallel) {
      // Parallel deployment for efficiency
      const deploymentPromises = deploymentPlan.agents.map(agent => 
        this.deployStackAwareAgent(agent, deploymentPlan.stack)
      );
      
      const parallelResults = await Promise.all(deploymentPromises);
      results.push(...parallelResults);
    } else {
      // Sequential deployment for high-priority tasks
      for (const agent of deploymentPlan.agents) {
        const result = await this.deployStackAwareAgent(agent, deploymentPlan.stack);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 🤖 Deploy individual stack-aware agent
   */
  async deployStackAwareAgent(agentConfig, stack) {
    const { type: agentType, mcps, focus, config } = agentConfig;

    console.log(`🤖 Deploying ${agentType} with stack-aware MCPs: ${mcps.slice(0, 3).join(', ')}...`);

    // Generate stack-specific prompt
    const prompt = this.generateStackAwarePrompt(agentType, mcps, focus, stack, config);

    try {
      // Simulate agent deployment (In real Claude Code, this would use Task tool)
      const result = await this.executeStackAwareAgentTask({
        description: `Deploy ${agentType} agent with ${stack.frontend?.framework}+${stack.backend?.service} optimization`,
        prompt: prompt,
        subagent_type: 'general-purpose',
        mcps: mcps,
        config: config
      });

      this.recordStackAwareDeployment(agentType, result, stack);
      return { 
        agent: agentType, 
        mcps, 
        focus, 
        result, 
        stack: `${stack.frontend?.framework}+${stack.backend?.service}`,
        success: true 
      };

    } catch (error) {
      console.error(`❌ Failed to deploy stack-aware ${agentType} agent:`, error.message);
      return { 
        agent: agentType, 
        mcps, 
        error: error.message, 
        stack: `${stack.frontend?.framework}+${stack.backend?.service}`,
        success: false 
      };
    }
  }

  /**
   * 📝 Generate stack-aware prompts
   */
  generateStackAwarePrompt(agentType, mcps, focus, stack, config) {
    const basePrompts = {
      'database-architecture': `
        You are a Database Architecture specialist for ${stack.backend?.service || 'database'} systems.
        **STACK CONTEXT**: ${stack.frontend?.framework} + ${stack.backend?.service} + ${stack.deployment?.platform}
        
        **FOCUS**: ${focus}
        
        **STACK-SPECIFIC TASKS**:
        ${stack.backend?.service === 'Convex' ? `
        - Optimize Convex mutations for real-time medical quiz functionality
        - Design WebSocket subscriptions for live progress tracking
        - Implement Convex server functions for USMLE content management
        ` : ''}
        
        **MCPs TO USE**: ${mcps.join(', ')}
        
        **MEDICAL EDUCATION REQUIREMENTS**:
        ${config.medical ? `
        - HIPAA-compliant medical data modeling
        - USMLE question categorization and retrieval optimization
        - Student progress tracking with privacy protection
        ` : ''}
      `,

      'frontend-development': `
        You are a Frontend Development specialist for ${stack.frontend?.framework} applications.
        **STACK CONTEXT**: ${stack.frontend?.framework} ${stack.frontend?.version} + ${stack.frontend?.buildTool} + ${stack.styling?.frameworks?.[0]?.name}
        
        **FOCUS**: ${focus}
        
        **STACK-SPECIFIC TASKS**:
        ${stack.frontend?.framework === 'React' && stack.frontend?.buildTool === 'Vite' ? `
        - Optimize React 19 features and Vite build performance
        - Implement proper code splitting and lazy loading
        - Enhance hot module replacement for development efficiency
        ` : ''}
        
        **MCPs TO USE**: ${mcps.join(', ')}
        
        **MEDICAL EDUCATION REQUIREMENTS**:
        ${config.medical ? `
        - Accessible USMLE quiz interfaces with screen reader support
        - Mobile-optimized design for clinical rotation studying
        - Medical terminology support and abbreviation expansion
        ` : ''}
      `,

      'devops-deployment': `
        You are a DevOps & Deployment specialist for ${stack.deployment?.platform} platforms.
        **STACK CONTEXT**: ${stack.deployment?.platform} deployment with ${stack.frontend?.buildTool} build system
        
        **FOCUS**: ${focus}
        
        **STACK-SPECIFIC TASKS**:
        ${stack.deployment?.platform === 'Netlify' ? `
        - Optimize Netlify Functions for serverless medical data processing
        - Configure CDN and edge functions for global medical student access
        - Implement proper security headers for healthcare compliance
        ` : ''}
        
        **MCPs TO USE**: ${mcps.join(', ')}
        
        **MEDICAL EDUCATION REQUIREMENTS**:
        ${config.medical ? `
        - HIPAA-compliant deployment configuration
        - Healthcare-grade security headers and CSP
        - Global CDN optimization for medical education content
        ` : ''}
      `,

      'testing-qa': `
        You are a Testing & QA specialist for ${stack.testing?.frameworks?.map(f => f.name).join(' + ') || 'comprehensive testing'}.
        **STACK CONTEXT**: ${stack.frontend?.framework} + ${stack.testing?.frameworks?.map(f => f.name).join(', ')}
        
        **FOCUS**: ${focus}
        
        **STACK-SPECIFIC TASKS**:
        ${stack.testing?.frameworks?.some(f => f.name === 'Playwright') ? `
        - Implement Playwright E2E tests for medical quiz workflows
        - Test cross-browser compatibility for clinical environments
        - Validate accessibility compliance for medical students with disabilities
        ` : ''}
        
        **MCPs TO USE**: ${mcps.join(', ')}
        
        **MEDICAL EDUCATION REQUIREMENTS**:
        ${config.medical ? `
        - Medical content accuracy validation
        - USMLE quiz functionality testing
        - Healthcare workflow compliance testing
        ` : ''}
      `,

      'performance-optimization': `
        You are a Performance Optimization specialist for ${stack.frontend?.framework} applications.
        **STACK CONTEXT**: ${stack.frontend?.framework} + ${stack.frontend?.buildTool} + ${stack.deployment?.platform}
        
        **FOCUS**: ${focus}
        
        **STACK-SPECIFIC TASKS**:
        ${stack.frontend?.buildTool === 'Vite' ? `
        - Optimize Vite build configuration for production
        - Implement efficient code splitting and asset optimization
        - Enhance development server performance
        ` : ''}
        
        **MCPs TO USE**: ${mcps.join(', ')}
        
        **MEDICAL EDUCATION REQUIREMENTS**:
        ${config.medical ? `
        - Medical quiz loading optimization for clinical environments
        - Mobile performance for hospital WiFi networks
        - Accessibility performance for assistive technologies
        ` : ''}
      `
    };

    const prompt = basePrompts[agentType] || `
      You are a ${agentType} specialist for the detected technology stack.
      **STACK CONTEXT**: ${stack.frontend?.framework} + ${stack.backend?.service} + ${stack.deployment?.platform}
      **FOCUS**: ${focus}
      **MCPs TO USE**: ${mcps.join(', ')}
      ${config.medical ? '**MEDICAL CONTEXT**: Optimize for medical education and healthcare compliance.' : ''}
    `;

    return prompt.trim();
  }

  /**
   * 📊 Aggregate stack-aware results
   */
  aggregateStackAwareResults(results, analysis, stack) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      summary: {
        totalAgents: results.length,
        successful: successful.length,
        failed: failed.length,
        successRate: Math.round((successful.length / results.length) * 100),
        stack: `${stack.frontend?.framework}+${stack.backend?.service}+${stack.deployment?.platform}`,
        confidence: stack.overallConfidence
      },
      analysis: analysis,
      stack: stack,
      deployments: successful,
      failures: failed,
      recommendations: this.generateStackAwareRecommendations(successful, analysis, stack),
      nextSteps: this.generateStackAwareNextSteps(successful, analysis, stack)
    };
  }

  /**
   * 💡 Generate stack-aware recommendations
   */
  generateStackAwareRecommendations(successful, analysis, stack) {
    const recommendations = [];

    // Stack-specific recommendations
    if (stack.frontend?.framework === 'React' && stack.frontend?.buildTool === 'Vite') {
      recommendations.push({
        priority: 'medium',
        category: 'React + Vite Optimization',
        recommendation: 'Implement React 19 concurrent features and optimize Vite build configuration'
      });
    }

    if (stack.backend?.service === 'Convex') {
      recommendations.push({
        priority: 'high',
        category: 'Convex Optimization',
        recommendation: 'Optimize Convex mutations and WebSocket subscriptions for real-time medical quiz functionality'
      });
    }

    if (stack.deployment?.platform === 'Netlify') {
      recommendations.push({
        priority: 'medium',
        category: 'Netlify Optimization',
        recommendation: 'Enhance Netlify Functions and edge deployment for global medical student access'
      });
    }

    // Medical education specific recommendations
    if (analysis.medical || stack.specializations?.medical) {
      recommendations.push({
        priority: 'high',
        category: 'Medical Education',
        recommendation: 'Ensure WCAG 2.1 AA compliance and HIPAA-compliant data handling'
      });
    }

    return recommendations;
  }

  /**
   * 🎯 Generate stack-aware next steps
   */
  generateStackAwareNextSteps(successful, analysis, stack) {
    const nextSteps = [];

    if (successful.length > 0) {
      nextSteps.push(`Review stack-specific agent reports for ${stack.frontend?.framework}+${stack.backend?.service} optimizations`);
      nextSteps.push('Implement high-priority stack-aware improvements identified by agents');
      nextSteps.push('Schedule follow-up testing after stack-specific changes');
    }

    if (analysis.intent === 'deploy') {
      nextSteps.push(`Validate ${stack.deployment?.platform} production readiness checklist`);
      nextSteps.push('Execute stack-optimized deployment plan with monitoring');
    }

    if (stack.specializations?.medical) {
      nextSteps.push('Validate medical education compliance and accessibility standards');
    }

    return nextSteps;
  }

  /**
   * 🔧 Helper methods
   */
  getAllAgentTypes() {
    return [
      'database-architecture', 'frontend-development', 'authentication-security',
      'api-integration', 'workflow-orchestration', 'testing-qa',
      'devops-deployment', 'performance-optimization', 'documentation-knowledge',
      'search-discovery', 'analytics-monitoring', 'code-quality',
      'infrastructure', 'ai-llm-integration', 'browser-automation'
    ];
  }

  getIntentBasedAgents(analysis) {
    const intentAgentMap = {
      'debug': ['testing-qa', 'code-quality', 'performance-optimization'],
      'develop': ['frontend-development', 'database-architecture', 'testing-qa'],
      'test': ['testing-qa', 'browser-automation', 'performance-optimization'],
      'optimize': ['performance-optimization', 'infrastructure', 'code-quality'],
      'deploy': ['devops-deployment', 'authentication-security', 'performance-optimization']
    };

    return intentAgentMap[analysis.intent] || [];
  }

  detectIntent(input) {
    const intentPatterns = {
      'debug': ['bug', 'error', 'issue', 'problem', 'broken', 'fix'],
      'develop': ['build', 'create', 'implement', 'add', 'develop', 'new'],
      'test': ['test', 'validate', 'check', 'verify', 'audit'],
      'optimize': ['slow', 'performance', 'optimize', 'improve', 'speed'],
      'deploy': ['deploy', 'production', 'launch', 'release', 'publish'],
      'comprehensive': ['comprehensive', 'complete', 'full', 'all', 'everything']
    };

    for (const [intent, keywords] of Object.entries(intentPatterns)) {
      if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
        return intent;
      }
    }
    return 'general';
  }

  detectContext(input) {
    if (input.toLowerCase().includes('mobile')) return 'mobile';
    if (input.toLowerCase().includes('accessibility')) return 'accessibility';
    if (input.toLowerCase().includes('security')) return 'security';
    return 'general';
  }

  detectUrgency(input) {
    if (input.toLowerCase().includes('urgent') || input.toLowerCase().includes('critical')) return 'high';
    if (input.toLowerCase().includes('production') || input.toLowerCase().includes('deploy')) return 'medium';
    return 'low';
  }

  detectScope(input) {
    if (input.toLowerCase().includes('comprehensive') || input.toLowerCase().includes('complete')) return 'comprehensive';
    if (input.toLowerCase().includes('complex') || input.toLowerCase().includes('advanced')) return 'complex';
    return 'standard';
  }

  detectMedicalContext(input) {
    const medicalKeywords = [
      'usmle', 'medical', 'healthcare', 'clinical', 'patient',
      'medical student', 'doctor', 'physician', 'hospital',
      'quiz', 'exam', 'study', 'question', 'hipaa'
    ];
    return medicalKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  detectTriggers(input) {
    // This would be loaded from the MCP config, simplified for now
    return [];
  }

  recordStackAwareDeployment(agentType, result, stack) {
    this.deploymentHistory.push({
      timestamp: new Date().toISOString(),
      agent: agentType,
      result: result,
      stack: `${stack.frontend?.framework}+${stack.backend?.service}`,
      success: true
    });
  }

  /**
   * 🎮 Mock executeStackAwareAgentTask for testing
   */
  async executeStackAwareAgentTask(taskConfig) {
    console.log(`🎯 Executing stack-aware agent task: ${taskConfig.description}`);
    
    // Simulate stack-aware agent execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      agent: taskConfig.description,
      mcps: taskConfig.mcps,
      analysis: `Stack-aware analysis completed for ${taskConfig.config?.stack?.frontend?.framework} application`,
      recommendations: [
        `Stack-specific recommendation 1 for ${taskConfig.config?.stack?.backend?.service}`,
        `Stack-specific recommendation 2 for ${taskConfig.config?.stack?.deployment?.platform}`
      ],
      stackOptimizations: taskConfig.config?.stackSpecific || [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 🚀 Main function for Claude Code integration - Stack-Aware
 */
export async function claudeCodeStackAwareDeploy(userInput, context = {}) {
  const orchestrator = new StackAwareAgentOrchestrator();
  return await orchestrator.deployStackAwareAgents(userInput, context);
}

/**
 * 🧪 Stack-aware usage examples
 */
export const STACK_AWARE_EXAMPLES = {
  // React + Convex + Netlify optimization
  currentStack: () => claudeCodeStackAwareDeploy(
    "Optimize performance for USMLE quiz loading"
  ),
  // Expected: Performance + Database + Frontend agents with React/Convex/Netlify MCPs
  
  // Medical accessibility with current stack
  medicalAccessibility: () => claudeCodeStackAwareDeploy(
    "Check accessibility for medical students with disabilities"
  ),
  // Expected: Accessibility + Testing agents with React/Storybook/Playwright MCPs
  
  // Comprehensive stack-aware testing
  comprehensive: () => claudeCodeStackAwareDeploy(
    "Run comprehensive testing for production deployment"
  )
  // Expected: All agents with stack-specific MCP prioritization
};

export default StackAwareAgentOrchestrator;