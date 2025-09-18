/**
 * Orchestration Agent - Specialized agent for managing complex multi-agent workflows
 * Integrates with the WorkflowEngine to provide intelligent workflow coordination
 */

import { WorkflowEngine, WorkflowDefinition, WorkflowStep, AgentCapability } from './WorkflowEngine';
import { Logger, AgenticError, ErrorCode } from '../utils/errorHandling';
import { MultiModelAI } from '../services/MultiModelAI';
import { OpenAI } from 'openai';

// ============================================================================
// ORCHESTRATION INTERFACES
// ============================================================================

export interface OrchestrationRequest {
  objective: string;
  constraints?: {
    maxCost?: number;
    maxDuration?: number;
    requiredQuality?: 'basic' | 'good' | 'excellent';
    availableAgents?: string[];
  };
  context?: Record<string, any>;
  preferences?: {
    prioritizeSpeed?: boolean;
    prioritizeCost?: boolean;
    prioritizeQuality?: boolean;
    riskTolerance?: 'low' | 'medium' | 'high';
  };
}

export interface OrchestrationPlan {
  workflowId: string;
  estimatedCost: number;
  estimatedDuration: number;
  qualityScore: number;
  riskScore: number;
  steps: Array<{
    stepId: string;
    name: string;
    description: string;
    agentType: string;
    estimatedCost: number;
    estimatedDuration: number;
    dependencies: string[];
    criticality: 'low' | 'medium' | 'high';
  }>;
  alternatives?: OrchestrationPlan[];
}

export interface OrchestrationResult {
  success: boolean;
  executionId: string;
  actualCost: number;
  actualDuration: number;
  qualityAchieved: number;
  results: Record<string, any>;
  insights: string[];
  recommendations: string[];
}

// ============================================================================
// PREDEFINED WORKFLOW TEMPLATES
// ============================================================================

const WORKFLOW_TEMPLATES: Record<string, Partial<WorkflowDefinition>> = {
  'comprehensive-product-analysis': {
    name: 'Comprehensive Product Analysis',
    description: 'Full product analysis with prompt processing, market research, competitive analysis, and PRD generation',
    steps: [
      {
        id: 'prompt-processing',
        name: 'User Prompt Processing & Concept Structuring',
        agentType: 'PromptProcessorAgent',
        dependencies: [],
        timeout: 180000, // 3 minutes
        retryPolicy: { maxRetries: 2, backoffMs: 3000, exponential: true },
        required: true,
        parallelizable: false,
        inputs: {}
      },
      {
        id: 'market-research',
        name: 'Market Research Analysis',
        agentType: 'MarketResearchAgent',
        dependencies: ['prompt-processing'],
        timeout: 300000, // 5 minutes
        retryPolicy: { maxRetries: 2, backoffMs: 5000, exponential: true },
        required: true,
        parallelizable: true,
        inputs: {}
      },
      // TEMPORARILY COMMENTED OUT - CompetitiveLandscapeAgent hanging issue
      // {
      //   id: 'competitive-analysis',
      //   name: 'Competitive Landscape Analysis',
      //   agentType: 'CompetitiveLandscapeAgent',
      //   dependencies: ['prompt-processing'],
      //   timeout: 300000,
      //   retryPolicy: { maxRetries: 2, backoffMs: 5000, exponential: true },
      //   required: true,
      //   parallelizable: true,
      //   inputs: {}
      // },
      {
        id: 'prd-generation',
        name: 'Product Requirements Document Generation',
        agentType: 'DocumentPackageAgent',
        dependencies: ['market-research'],  // Removed competitive-analysis dependency
        timeout: 400000,
        retryPolicy: { maxRetries: 2, backoffMs: 5000, exponential: true },
        required: true,
        parallelizable: false,
        inputs: {}
      },
      {
        id: 'prototype-generation',
        name: 'Prototype Specifications',
        agentType: 'PrototypeGeneratorAgent',
        dependencies: ['prd-generation'],
        timeout: 600000,
        retryPolicy: { maxRetries: 1, backoffMs: 10000, exponential: false },
        required: false,
        parallelizable: false,
        inputs: {}
      },
      {
        id: 'pricing-analysis',
        name: 'Pricing Strategy Analysis',
        agentType: 'PricingAgent',
        dependencies: ['prd-generation'],
        timeout: 300000, // 5 minutes
        retryPolicy: { maxRetries: 2, backoffMs: 5000, exponential: true },
        required: true,
        parallelizable: false,
        inputs: {}
      },
      {
        id: 'evaluation',
        name: 'Multi-Model Evaluation',
        agentType: 'OptimizedEvalsAgent',
        dependencies: ['market-research', 'prd-generation', 'pricing-analysis'],  // Removed competitive-analysis
        timeout: 300000,
        retryPolicy: { maxRetries: 1, backoffMs: 5000, exponential: false },
        required: false,
        parallelizable: false,
        inputs: {}
      }
    ]
  },

  'rapid-market-validation': {
    name: 'Rapid Market Validation',
    description: 'Quick market validation with prompt processing and basic competitive analysis',
    steps: [
      {
        id: 'prompt-processing',
        name: 'Quick Prompt Processing',
        agentType: 'PromptProcessorAgent',
        dependencies: [],
        timeout: 90000, // 1.5 minutes
        retryPolicy: { maxRetries: 1, backoffMs: 2000, exponential: false },
        required: true,
        parallelizable: false,
        inputs: {}
      },
      {
        id: 'quick-market-scan',
        name: 'Quick Market Scan',
        agentType: 'MarketResearchAgent',
        dependencies: ['prompt-processing'],
        timeout: 120000, // 2 minutes
        retryPolicy: { maxRetries: 1, backoffMs: 3000, exponential: false },
        required: true,
        parallelizable: true,
        inputs: { depth: 'basic' }
      },
      {
        id: 'competitor-overview',
        name: 'Competitor Overview',
        agentType: 'CompetitiveLandscapeAgent',
        dependencies: ['prompt-processing'],
        timeout: 120000,
        retryPolicy: { maxRetries: 1, backoffMs: 3000, exponential: false },
        required: true,
        parallelizable: true,
        inputs: { depth: 'basic' }
      },
      {
        id: 'quick-evaluation',
        name: 'Quick Evaluation',
        agentType: 'OptimizedEvalsAgent',
        dependencies: ['quick-market-scan', 'competitor-overview'],
        timeout: 180000,
        retryPolicy: { maxRetries: 1, backoffMs: 3000, exponential: false },
        required: true,
        parallelizable: false,
        inputs: { evaluationModels: ['gpt-4-turbo-preview'] }
      }
    ]
  },

  'deep-strategic-analysis': {
    name: 'Deep Strategic Analysis',
    description: 'Comprehensive strategic analysis with prompt processing and multiple validation rounds',
    steps: [
      {
        id: 'prompt-processing',
        name: 'Advanced Prompt Processing',
        agentType: 'PromptProcessorAgent',
        dependencies: [],
        timeout: 240000, // 4 minutes
        retryPolicy: { maxRetries: 2, backoffMs: 5000, exponential: true },
        required: true,
        parallelizable: false,
        inputs: {}
      },
      {
        id: 'comprehensive-market-research',
        name: 'Comprehensive Market Research',
        agentType: 'MarketResearchAgent',
        dependencies: ['prompt-processing'],
        timeout: 600000, // 10 minutes
        retryPolicy: { maxRetries: 3, backoffMs: 10000, exponential: true },
        required: true,
        parallelizable: true,
        inputs: { depth: 'comprehensive' }
      },
      {
        id: 'detailed-competitive-analysis',
        name: 'Detailed Competitive Analysis',
        agentType: 'CompetitiveLandscapeAgent',
        dependencies: ['prompt-processing'],
        timeout: 600000,
        retryPolicy: { maxRetries: 3, backoffMs: 10000, exponential: true },
        required: true,
        parallelizable: true,
        inputs: { depth: 'comprehensive' }
      },
      {
        id: 'advanced-prd-generation',
        name: 'Advanced PRD Generation',
        agentType: 'DocumentPackageAgent',
        dependencies: ['comprehensive-market-research', 'detailed-competitive-analysis'],
        timeout: 800000,
        retryPolicy: { maxRetries: 2, backoffMs: 10000, exponential: true },
        required: true,
        parallelizable: false,
        inputs: { template: 'enterprise', includeFinancials: true }
      },
      {
        id: 'prototype-development',
        name: 'Prototype Development',
        agentType: 'PrototypeGeneratorAgent',
        dependencies: ['advanced-prd-generation'],
        timeout: 1200000, // 20 minutes
        retryPolicy: { maxRetries: 2, backoffMs: 15000, exponential: true },
        required: false,
        parallelizable: false,
        inputs: { fidelity: 'high', includeInteractions: true }
      },
      {
        id: 'multi-model-evaluation',
        name: 'Multi-Model Evaluation',
        agentType: 'OptimizedEvalsAgent',
        dependencies: ['comprehensive-market-research', 'detailed-competitive-analysis', 'advanced-prd-generation'],
        timeout: 600000,
        retryPolicy: { maxRetries: 2, backoffMs: 10000, exponential: true },
        required: true,
        parallelizable: false,
        inputs: { 
          evaluationModels: ['gpt-4-turbo-preview', 'claude-3-opus-20240229'],
          includeRiskAnalysis: true 
        }
      },
      {
        id: 'advanced-pricing-analysis',
        name: 'Advanced Pricing Strategy',
        agentType: 'PricingAgent',
        dependencies: ['advanced-prd-generation'],
        timeout: 400000, // 6.7 minutes
        retryPolicy: { maxRetries: 2, backoffMs: 10000, exponential: true },
        required: true,
        parallelizable: false,
        inputs: {}
      },
      {
        id: 'strategic-recommendations',
        name: 'Strategic Recommendations',
        agentType: 'DocumentPackageAgent',
        dependencies: ['multi-model-evaluation', 'prototype-development', 'advanced-pricing-analysis'],
        timeout: 400000,
        retryPolicy: { maxRetries: 1, backoffMs: 10000, exponential: false },
        required: true,
        parallelizable: false,
        inputs: { template: 'executive-summary' }
      }
    ]
  }
};

// ============================================================================
// ORCHESTRATION AGENT
// ============================================================================

export class OrchestrationAgent {
  private workflowEngine: WorkflowEngine;
  private multiModelAI: MultiModelAI;
  private logger: Logger;
  private registeredAgents: Map<string, AgentCapability> = new Map();

  constructor() {
    this.workflowEngine = new WorkflowEngine();
    this.multiModelAI = new MultiModelAI();
    this.logger = Logger.getInstance();
    
    this.initializeWorkflowTemplates();
    this.initializeDefaultAgents();
    this.setupEventListeners();
  }

  // ============================================================================
  // MAIN ORCHESTRATION METHODS
  // ============================================================================

  async orchestrate(request: OrchestrationRequest): Promise<OrchestrationResult> {
    const requestId = `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.logger.setContext(requestId);

    this.logger.info('Starting orchestration request', {
      objective: request.objective,
      constraints: request.constraints,
      preferences: request.preferences
    }, 'OrchestrationAgent');

    try {
      // Step 1: Analyze the objective and create orchestration plan
      const plan = await this.createOrchestrationPlan(request);

      this.logger.info('Orchestration plan created', {
        workflowId: plan.workflowId,
        estimatedCost: plan.estimatedCost,
        estimatedDuration: plan.estimatedDuration,
        stepsCount: plan.steps.length
      }, 'OrchestrationAgent');

      // Step 2: Execute the planned workflow
      const execution = await this.workflowEngine.executeWorkflow(
        plan.workflowId,
        request.context || {},
        {
          maxCost: request.constraints?.maxCost,
          maxDuration: request.constraints?.maxDuration
        }
      );

      // Step 3: Analyze results and generate insights
      const result = await this.analyzeExecutionResults(execution, plan, request);

      this.logger.info('Orchestration completed successfully', {
        executionId: execution.id,
        actualCost: result.actualCost,
        actualDuration: result.actualDuration,
        qualityAchieved: result.qualityAchieved
      }, 'OrchestrationAgent');

      return result;

    } catch (error) {
      this.logger.error('Orchestration failed', error as Error, {
        objective: request.objective
      }, 'OrchestrationAgent');

      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        `Orchestration failed: ${(error as Error).message}`,
        'The orchestration request could not be completed. Please try again.',
        { objective: request.objective, originalError: (error as Error).message },
        true
      );
    }
  }

  async createOrchestrationPlan(request: OrchestrationRequest): Promise<OrchestrationPlan> {
    // Analyze the objective to determine the best workflow template
    const workflowTemplate = await this.selectWorkflowTemplate(request);
    
    // Customize the workflow based on constraints and preferences
    const customizedWorkflow = this.customizeWorkflow(workflowTemplate, request);
    
    // Register the workflow with the engine
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const workflow: WorkflowDefinition = {
      ...customizedWorkflow,
      id: workflowId,
      name: customizedWorkflow.name || `Workflow_${workflowId}`,
      description: customizedWorkflow.description || `Orchestrated workflow for analysis`,
      steps: customizedWorkflow.steps || [],
      version: '1.0',
      defaultTimeout: 300000,
      maxConcurrentSteps: 3,
      failureStrategy: request.preferences?.riskTolerance === 'low' ? 'fail-fast' : 'continue-on-error',
      metadata: { 
        originalRequest: request,
        createdAt: new Date().toISOString()
      }
    };

    this.workflowEngine.registerWorkflow(workflow);

    // Calculate estimates
    const estimates = this.calculateWorkflowEstimates(workflow);

    const plan: OrchestrationPlan = {
      workflowId,
      estimatedCost: estimates.cost,
      estimatedDuration: estimates.duration,
      qualityScore: estimates.quality,
      riskScore: estimates.risk,
      steps: workflow.steps.map(step => ({
        stepId: step.id,
        name: step.name,
        description: `Execute ${step.name} using ${step.agentType}`,
        agentType: step.agentType,
        estimatedCost: this.getAgentCost(step.agentType),
        estimatedDuration: this.getAgentLatency(step.agentType),
        dependencies: step.dependencies,
        criticality: step.required ? 'high' : 'medium'
      }))
    };

    return plan;
  }

  // ============================================================================
  // WORKFLOW TEMPLATE SELECTION AND CUSTOMIZATION
  // ============================================================================

  private async selectWorkflowTemplate(request: OrchestrationRequest): Promise<Partial<WorkflowDefinition>> {
    // Use AI to analyze the objective and select the best template
    const analysisPrompt = `
Analyze this product management objective and recommend the most appropriate workflow template:

OBJECTIVE: ${request.objective}

CONSTRAINTS:
${JSON.stringify(request.constraints || {}, null, 2)}

PREFERENCES:
${JSON.stringify(request.preferences || {}, null, 2)}

AVAILABLE TEMPLATES:
${Object.keys(WORKFLOW_TEMPLATES).map(key => `- ${key}: ${WORKFLOW_TEMPLATES[key].description}`).join('\n')}

Consider:
1. Complexity and depth required
2. Time and cost constraints
3. Quality requirements
4. Risk tolerance

Respond with just the template key that best matches the requirements.
`;

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3
      });

      const recommendedTemplate = response.choices[0].message.content?.trim();
      
      if (recommendedTemplate && WORKFLOW_TEMPLATES[recommendedTemplate]) {
        this.logger.info(`Selected workflow template: ${recommendedTemplate}`, {
          objective: request.objective
        }, 'OrchestrationAgent');
        
        return WORKFLOW_TEMPLATES[recommendedTemplate];
      }
    } catch (error) {
      this.logger.warn('Failed to get AI template recommendation, using default', {
        error: (error as Error).message
      }, 'OrchestrationAgent');
    }

    // Fallback: select based on simple heuristics
    if (request.constraints?.maxDuration && request.constraints.maxDuration < 300000) {
      return WORKFLOW_TEMPLATES['rapid-market-validation'];
    } else if (request.preferences?.prioritizeQuality || request.constraints?.requiredQuality === 'excellent') {
      return WORKFLOW_TEMPLATES['deep-strategic-analysis'];
    } else {
      return WORKFLOW_TEMPLATES['comprehensive-product-analysis'];
    }
  }

  private customizeWorkflow(
    template: Partial<WorkflowDefinition>, 
    request: OrchestrationRequest
  ): Partial<WorkflowDefinition> {
    const customized = JSON.parse(JSON.stringify(template)); // Deep clone

    if (!customized.steps) return customized;

    // Customize based on preferences
    if (request.preferences?.prioritizeSpeed) {
      // Reduce timeouts and retries
      customized.steps.forEach((step: WorkflowStep) => {
        step.timeout = Math.min(step.timeout, 180000); // Max 3 minutes
        step.retryPolicy.maxRetries = Math.min(step.retryPolicy.maxRetries, 1);
      });
    }

    if (request.preferences?.prioritizeCost) {
      // Remove optional steps and use basic configurations
      customized.steps = customized.steps.filter((step: WorkflowStep) => step.required);
      customized.steps.forEach((step: WorkflowStep) => {
        if (step.inputs) {
          step.inputs.depth = 'basic';
          step.inputs.fidelity = 'low';
        }
      });
    }

    if (request.constraints?.availableAgents) {
      // Filter steps to only use available agents
      customized.steps = customized.steps.filter((step: WorkflowStep) => 
        request.constraints!.availableAgents!.includes(step.agentType)
      );
    }

    // Add context to all steps
    customized.steps.forEach((step: WorkflowStep) => {
      step.inputs = {
        ...step.inputs,
        objective: request.objective,
        context: request.context
      };
    });

    return customized;
  }

  // ============================================================================
  // EXECUTION ANALYSIS AND INSIGHTS
  // ============================================================================

  private async analyzeExecutionResults(
    execution: any,
    plan: OrchestrationPlan,
    request: OrchestrationRequest
  ): Promise<OrchestrationResult> {
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Analyze performance vs estimates
    const costVariance = ((execution.metrics.costIncurred - plan.estimatedCost) / plan.estimatedCost) * 100;
    const durationVariance = ((execution.metrics.totalDuration - plan.estimatedDuration) / plan.estimatedDuration) * 100;

    if (Math.abs(costVariance) > 20) {
      insights.push(`Cost variance: ${costVariance.toFixed(1)}% ${costVariance > 0 ? 'over' : 'under'} estimate`);
    }

    if (Math.abs(durationVariance) > 20) {
      insights.push(`Duration variance: ${durationVariance.toFixed(1)}% ${durationVariance > 0 ? 'over' : 'under'} estimate`);
    }

    // Analyze step performance
    const failedSteps = execution.failedSteps.length;
    const totalSteps = execution.metrics.totalSteps;
    const successRate = ((totalSteps - failedSteps) / totalSteps) * 100;

    if (successRate < 100) {
      insights.push(`${failedSteps} out of ${totalSteps} steps failed (${successRate.toFixed(1)}% success rate)`);
      recommendations.push('Consider reviewing failed steps and improving retry policies');
    }

    // Quality assessment based on completed steps
    let qualityScore = successRate;
    if (execution.stepResults['evaluation']) {
      qualityScore = execution.stepResults['evaluation'].consensusScore || qualityScore;
    }

    // Generate recommendations based on performance
    if (costVariance > 50) {
      recommendations.push('Consider optimizing agent selection or using more cost-effective models');
    }

    if (durationVariance > 50) {
      recommendations.push('Consider parallelizing more steps or using faster agents');
    }

    if (qualityScore < 70) {
      recommendations.push('Quality score is below threshold - consider additional validation steps');
    }

    return {
      success: execution.status === 'completed',
      executionId: execution.id,
      actualCost: execution.metrics.costIncurred,
      actualDuration: execution.metrics.totalDuration,
      qualityAchieved: qualityScore,
      results: execution.stepResults,
      insights,
      recommendations
    };
  }

  // ============================================================================
  // UTILITY AND HELPER METHODS
  // ============================================================================

  private calculateWorkflowEstimates(workflow: WorkflowDefinition): {
    cost: number;
    duration: number;
    quality: number;
    risk: number;
  } {
    let totalCost = 0;
    let totalDuration = 0;
    let qualityScore = 0;
    let riskScore = 0;

    // Calculate parallel execution paths
    const dependencyGraph = new Map<string, string[]>();
    workflow.steps.forEach(step => dependencyGraph.set(step.id, step.dependencies));

    // Simple estimation - in reality, you'd use more sophisticated algorithms
    workflow.steps.forEach(step => {
      const agentCost = this.getAgentCost(step.agentType);
      const agentLatency = this.getAgentLatency(step.agentType);
      
      totalCost += agentCost * (step.retryPolicy.maxRetries + 1); // Account for retries
      
      // For duration, we need to consider parallelization
      // This is a simplified calculation
      if (step.parallelizable) {
        totalDuration = Math.max(totalDuration, agentLatency);
      } else {
        totalDuration += agentLatency;
      }

      // Quality and risk scoring
      if (step.required) {
        qualityScore += 20; // Required steps contribute more to quality
        riskScore += step.retryPolicy.maxRetries === 0 ? 15 : 5;
      } else {
        qualityScore += 10;
        riskScore += 2;
      }
    });

    return {
      cost: totalCost,
      duration: totalDuration,
      quality: Math.min(100, qualityScore),
      risk: Math.min(100, riskScore)
    };
  }

  private getAgentCost(agentType: string): number {
    const agent = this.registeredAgents.get(agentType);
    return agent?.costPerOperation || 0.05; // Default cost
  }

  private getAgentLatency(agentType: string): number {
    const agent = this.registeredAgents.get(agentType);
    return agent?.avgLatencyMs || 30000; // Default 30 seconds
  }

  private initializeWorkflowTemplates(): void {
    Object.entries(WORKFLOW_TEMPLATES).forEach(([key, template]) => {
      this.logger.info(`Initialized workflow template: ${key}`, {
        name: template.name,
        stepsCount: template.steps?.length || 0
      }, 'OrchestrationAgent');
    });
  }

  private initializeDefaultAgents(): void {
    const defaultAgents: AgentCapability[] = [
      {
        agentType: 'MarketResearchAgent',
        capabilities: ['market-analysis', 'trend-research', 'tam-sam-som'],
        costPerOperation: 0.08,
        avgLatencyMs: 45000,
        successRate: 0.95,
        maxConcurrency: 2,
        isAvailable: true
      },
      {
        agentType: 'CompetitiveLandscapeAgent',
        capabilities: ['competitor-analysis', 'swot-analysis', 'positioning'],
        costPerOperation: 0.06,
        avgLatencyMs: 35000,
        successRate: 0.92,
        maxConcurrency: 2,
        isAvailable: true
      },
      {
        agentType: 'DocumentPackageAgent',
        capabilities: ['prd-generation', 'document-creation', 'formatting'],
        costPerOperation: 0.10,
        avgLatencyMs: 60000,
        successRate: 0.98,
        maxConcurrency: 1,
        isAvailable: true
      },
      {
        agentType: 'PrototypeGeneratorAgent',
        capabilities: ['prototype-creation', 'ui-generation', 'mockups'],
        costPerOperation: 0.15,
        avgLatencyMs: 120000,
        successRate: 0.85,
        maxConcurrency: 1,
        isAvailable: true
      },
      {
        agentType: 'OptimizedEvalsAgent',
        capabilities: ['quality-assessment', 'multi-model-evaluation', 'scoring', 'cost-optimization'],
        costPerOperation: 0.08, // More cost-effective than legacy EvaluationAgent
        avgLatencyMs: 30000,    // Faster due to caching and optimization
        successRate: 0.98,      // Higher success rate
        maxConcurrency: 2,      // Better concurrency support
        isAvailable: true
      },
      {
        agentType: 'PricingAgent',
        capabilities: ['pricing-strategy', 'value-metrics', 'tier-analysis', 'competitive-pricing'],
        costPerOperation: 0.12,
        avgLatencyMs: 50000, // 50 seconds (complex pricing analysis)
        successRate: 0.94,
        maxConcurrency: 1,
        isAvailable: true
      },
      {
        agentType: 'PromptProcessorAgent',
        capabilities: ['prompt-analysis', 'concept-extraction', 'clarification-generation'],
        costPerOperation: 0.05,
        avgLatencyMs: 25000, // 25 seconds (fast prompt processing)
        successRate: 0.97,
        maxConcurrency: 2,
        isAvailable: true
      }
    ];

    defaultAgents.forEach(agent => {
      this.registeredAgents.set(agent.agentType, agent);
      this.workflowEngine.registerAgent(agent);
    });

    this.logger.info(`Initialized ${defaultAgents.length} default agents`, {
      agents: defaultAgents.map(a => a.agentType)
    }, 'OrchestrationAgent');
  }

  private setupEventListeners(): void {
    this.workflowEngine.on('workflow:started', ({ executionId, workflowId }) => {
      this.logger.info(`Workflow execution started`, { executionId, workflowId }, 'OrchestrationAgent');
    });

    this.workflowEngine.on('workflow:completed', ({ executionId, execution }) => {
      this.logger.info(`Workflow execution completed`, { 
        executionId, 
        duration: execution.metrics.totalDuration,
        cost: execution.metrics.costIncurred 
      }, 'OrchestrationAgent');
    });

    this.workflowEngine.on('workflow:failed', ({ executionId, execution, error }) => {
      this.logger.warn(`Workflow execution failed`, { 
        executionId, 
        error: error.message,
        completedSteps: execution.completedSteps.length 
      }, 'OrchestrationAgent');
    });
  }

  // ============================================================================
  // PUBLIC UTILITY METHODS
  // ============================================================================

  getAvailableWorkflowTemplates(): Record<string, string> {
    return Object.fromEntries(
      Object.entries(WORKFLOW_TEMPLATES).map(([key, template]) => [key, template.description || ''])
    );
  }

  async estimateRequest(request: OrchestrationRequest): Promise<{
    estimatedCost: number;
    estimatedDuration: number;
    recommendedTemplate: string;
    alternatives: Array<{ template: string; cost: number; duration: number; }>;
  }> {
    const plan = await this.createOrchestrationPlan(request);
    
    // Generate alternatives
    const alternatives = await Promise.all(
      Object.keys(WORKFLOW_TEMPLATES).map(async (templateKey) => {
        if (templateKey === plan.workflowId) return null;
        
        const altRequest = { ...request };
        const altTemplate = WORKFLOW_TEMPLATES[templateKey];
        const altWorkflow: WorkflowDefinition = {
          ...altTemplate as WorkflowDefinition,
          id: `temp_${templateKey}`,
          version: '1.0',
          defaultTimeout: 300000,
          maxConcurrentSteps: 3,
          failureStrategy: 'continue-on-error',
          metadata: {}
        };
        
        const estimates = this.calculateWorkflowEstimates(altWorkflow);
        return {
          template: templateKey,
          cost: estimates.cost,
          duration: estimates.duration
        };
      })
    );

    return {
      estimatedCost: plan.estimatedCost,
      estimatedDuration: plan.estimatedDuration,
      recommendedTemplate: plan.workflowId,
      alternatives: alternatives.filter(Boolean) as Array<{ template: string; cost: number; duration: number; }>
    };
  }

  registerCustomAgent(agent: AgentCapability): void {
    this.registeredAgents.set(agent.agentType, agent);
    this.workflowEngine.registerAgent(agent);
    
    this.logger.info(`Custom agent registered: ${agent.agentType}`, {
      capabilities: agent.capabilities,
      cost: agent.costPerOperation,
      latency: agent.avgLatencyMs
    }, 'OrchestrationAgent');
  }

  getExecutionStatus(executionId: string): any {
    return this.workflowEngine.getWorkflowStatus(executionId);
  }

  async cancelExecution(executionId: string): Promise<boolean> {
    return await this.workflowEngine.cancelExecution(executionId);
  }
}