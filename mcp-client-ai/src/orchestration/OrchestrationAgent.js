"use strict";
/**
 * Orchestration Agent - Specialized agent for managing complex multi-agent workflows
 * Integrates with the WorkflowEngine to provide intelligent workflow coordination
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestrationAgent = void 0;
const WorkflowEngine_1 = require("./WorkflowEngine");
const errorHandling_1 = require("../utils/errorHandling");
const MultiModelAI_1 = require("../services/MultiModelAI");
// ============================================================================
// PREDEFINED WORKFLOW TEMPLATES
// ============================================================================
const WORKFLOW_TEMPLATES = {
    'comprehensive-product-analysis': {
        name: 'Comprehensive Product Analysis',
        description: 'Full product analysis with market research, competitive analysis, and PRD generation',
        steps: [
            {
                id: 'market-research',
                name: 'Market Research Analysis',
                agentType: 'MarketResearchAgent',
                dependencies: [],
                timeout: 300000, // 5 minutes
                retryPolicy: { maxRetries: 2, backoffMs: 5000, exponential: true },
                required: true,
                parallelizable: true,
                inputs: {}
            },
            {
                id: 'competitive-analysis',
                name: 'Competitive Landscape Analysis',
                agentType: 'CompetitiveLandscapeAgent',
                dependencies: [],
                timeout: 300000,
                retryPolicy: { maxRetries: 2, backoffMs: 5000, exponential: true },
                required: true,
                parallelizable: true,
                inputs: {}
            },
            {
                id: 'prd-generation',
                name: 'Product Requirements Document Generation',
                agentType: 'DocumentPackageAgent',
                dependencies: ['market-research', 'competitive-analysis'],
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
                id: 'evaluation',
                name: 'Multi-Model Evaluation',
                agentType: 'EvaluationAgent',
                dependencies: ['market-research', 'competitive-analysis', 'prd-generation'],
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
        description: 'Quick market validation with basic competitive analysis',
        steps: [
            {
                id: 'quick-market-scan',
                name: 'Quick Market Scan',
                agentType: 'MarketResearchAgent',
                dependencies: [],
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
                dependencies: [],
                timeout: 120000,
                retryPolicy: { maxRetries: 1, backoffMs: 3000, exponential: false },
                required: true,
                parallelizable: true,
                inputs: { depth: 'basic' }
            },
            {
                id: 'quick-evaluation',
                name: 'Quick Evaluation',
                agentType: 'EvaluationAgent',
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
        description: 'Comprehensive strategic analysis with multiple validation rounds',
        steps: [
            {
                id: 'comprehensive-market-research',
                name: 'Comprehensive Market Research',
                agentType: 'MarketResearchAgent',
                dependencies: [],
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
                dependencies: [],
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
                agentType: 'EvaluationAgent',
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
                id: 'strategic-recommendations',
                name: 'Strategic Recommendations',
                agentType: 'DocumentPackageAgent',
                dependencies: ['multi-model-evaluation', 'prototype-development'],
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
class OrchestrationAgent {
    constructor() {
        this.registeredAgents = new Map();
        this.workflowEngine = new WorkflowEngine_1.WorkflowEngine();
        this.multiModelAI = new MultiModelAI_1.MultiModelAI();
        this.logger = errorHandling_1.Logger.getInstance();
        this.initializeWorkflowTemplates();
        this.initializeDefaultAgents();
        this.setupEventListeners();
    }
    // ============================================================================
    // MAIN ORCHESTRATION METHODS
    // ============================================================================
    orchestrate(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const requestId = `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.logger.setContext(requestId);
            this.logger.info('Starting orchestration request', {
                objective: request.objective,
                constraints: request.constraints,
                preferences: request.preferences
            }, 'OrchestrationAgent');
            try {
                // Step 1: Analyze the objective and create orchestration plan
                const plan = yield this.createOrchestrationPlan(request);
                this.logger.info('Orchestration plan created', {
                    workflowId: plan.workflowId,
                    estimatedCost: plan.estimatedCost,
                    estimatedDuration: plan.estimatedDuration,
                    stepsCount: plan.steps.length
                }, 'OrchestrationAgent');
                // Step 2: Execute the planned workflow
                const execution = yield this.workflowEngine.executeWorkflow(plan.workflowId, request.context || {}, {
                    maxCost: (_a = request.constraints) === null || _a === void 0 ? void 0 : _a.maxCost,
                    maxDuration: (_b = request.constraints) === null || _b === void 0 ? void 0 : _b.maxDuration
                });
                // Step 3: Analyze results and generate insights
                const result = yield this.analyzeExecutionResults(execution, plan, request);
                this.logger.info('Orchestration completed successfully', {
                    executionId: execution.id,
                    actualCost: result.actualCost,
                    actualDuration: result.actualDuration,
                    qualityAchieved: result.qualityAchieved
                }, 'OrchestrationAgent');
                return result;
            }
            catch (error) {
                this.logger.error('Orchestration failed', error, {
                    objective: request.objective
                }, 'OrchestrationAgent');
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.PROCESSING_ERROR, `Orchestration failed: ${error.message}`, 'The orchestration request could not be completed. Please try again.', { objective: request.objective, originalError: error.message }, true);
            }
        });
    }
    createOrchestrationPlan(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Analyze the objective to determine the best workflow template
            const workflowTemplate = yield this.selectWorkflowTemplate(request);
            // Customize the workflow based on constraints and preferences
            const customizedWorkflow = this.customizeWorkflow(workflowTemplate, request);
            // Register the workflow with the engine
            const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            const workflow = Object.assign(Object.assign({}, customizedWorkflow), { id: workflowId, version: '1.0', defaultTimeout: 300000, maxConcurrentSteps: 3, failureStrategy: ((_a = request.preferences) === null || _a === void 0 ? void 0 : _a.riskTolerance) === 'low' ? 'fail-fast' : 'continue-on-error', metadata: {
                    originalRequest: request,
                    createdAt: new Date().toISOString()
                } });
            this.workflowEngine.registerWorkflow(workflow);
            // Calculate estimates
            const estimates = this.calculateWorkflowEstimates(workflow);
            const plan = {
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
        });
    }
    // ============================================================================
    // WORKFLOW TEMPLATE SELECTION AND CUSTOMIZATION
    // ============================================================================
    selectWorkflowTemplate(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
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
                const response = yield this.multiModelAI.queryMultipleModels({
                    prompt: analysisPrompt,
                    models: ['gpt-4-turbo-preview'],
                    temperature: 0.3,
                    maxTokens: 100
                });
                const recommendedTemplate = (_a = response.responses['gpt-4-turbo-preview']) === null || _a === void 0 ? void 0 : _a.content.trim();
                if (recommendedTemplate && WORKFLOW_TEMPLATES[recommendedTemplate]) {
                    this.logger.info(`Selected workflow template: ${recommendedTemplate}`, {
                        objective: request.objective
                    }, 'OrchestrationAgent');
                    return WORKFLOW_TEMPLATES[recommendedTemplate];
                }
            }
            catch (error) {
                this.logger.warn('Failed to get AI template recommendation, using default', {
                    error: error.message
                }, 'OrchestrationAgent');
            }
            // Fallback: select based on simple heuristics
            if (((_b = request.constraints) === null || _b === void 0 ? void 0 : _b.maxDuration) && request.constraints.maxDuration < 300000) {
                return WORKFLOW_TEMPLATES['rapid-market-validation'];
            }
            else if (((_c = request.preferences) === null || _c === void 0 ? void 0 : _c.prioritizeQuality) || ((_d = request.constraints) === null || _d === void 0 ? void 0 : _d.requiredQuality) === 'excellent') {
                return WORKFLOW_TEMPLATES['deep-strategic-analysis'];
            }
            else {
                return WORKFLOW_TEMPLATES['comprehensive-product-analysis'];
            }
        });
    }
    customizeWorkflow(template, request) {
        var _a, _b, _c;
        const customized = JSON.parse(JSON.stringify(template)); // Deep clone
        if (!customized.steps)
            return customized;
        // Customize based on preferences
        if ((_a = request.preferences) === null || _a === void 0 ? void 0 : _a.prioritizeSpeed) {
            // Reduce timeouts and retries
            customized.steps.forEach((step) => {
                step.timeout = Math.min(step.timeout, 180000); // Max 3 minutes
                step.retryPolicy.maxRetries = Math.min(step.retryPolicy.maxRetries, 1);
            });
        }
        if ((_b = request.preferences) === null || _b === void 0 ? void 0 : _b.prioritizeCost) {
            // Remove optional steps and use basic configurations
            customized.steps = customized.steps.filter((step) => step.required);
            customized.steps.forEach((step) => {
                if (step.inputs) {
                    step.inputs.depth = 'basic';
                    step.inputs.fidelity = 'low';
                }
            });
        }
        if ((_c = request.constraints) === null || _c === void 0 ? void 0 : _c.availableAgents) {
            // Filter steps to only use available agents
            customized.steps = customized.steps.filter((step) => request.constraints.availableAgents.includes(step.agentType));
        }
        // Add context to all steps
        customized.steps.forEach((step) => {
            step.inputs = Object.assign(Object.assign({}, step.inputs), { objective: request.objective, context: request.context });
        });
        return customized;
    }
    // ============================================================================
    // EXECUTION ANALYSIS AND INSIGHTS
    // ============================================================================
    analyzeExecutionResults(execution, plan, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const insights = [];
            const recommendations = [];
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
        });
    }
    // ============================================================================
    // UTILITY AND HELPER METHODS
    // ============================================================================
    calculateWorkflowEstimates(workflow) {
        let totalCost = 0;
        let totalDuration = 0;
        let qualityScore = 0;
        let riskScore = 0;
        // Calculate parallel execution paths
        const dependencyGraph = new Map();
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
            }
            else {
                totalDuration += agentLatency;
            }
            // Quality and risk scoring
            if (step.required) {
                qualityScore += 20; // Required steps contribute more to quality
                riskScore += step.retryPolicy.maxRetries === 0 ? 15 : 5;
            }
            else {
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
    getAgentCost(agentType) {
        const agent = this.registeredAgents.get(agentType);
        return (agent === null || agent === void 0 ? void 0 : agent.costPerOperation) || 0.05; // Default cost
    }
    getAgentLatency(agentType) {
        const agent = this.registeredAgents.get(agentType);
        return (agent === null || agent === void 0 ? void 0 : agent.avgLatencyMs) || 30000; // Default 30 seconds
    }
    initializeWorkflowTemplates() {
        Object.entries(WORKFLOW_TEMPLATES).forEach(([key, template]) => {
            var _a;
            this.logger.info(`Initialized workflow template: ${key}`, {
                name: template.name,
                stepsCount: ((_a = template.steps) === null || _a === void 0 ? void 0 : _a.length) || 0
            }, 'OrchestrationAgent');
        });
    }
    initializeDefaultAgents() {
        const defaultAgents = [
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
                agentType: 'EvaluationAgent',
                capabilities: ['quality-assessment', 'multi-model-evaluation', 'scoring'],
                costPerOperation: 0.12,
                avgLatencyMs: 40000,
                successRate: 0.96,
                maxConcurrency: 1,
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
    setupEventListeners() {
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
    getAvailableWorkflowTemplates() {
        return Object.fromEntries(Object.entries(WORKFLOW_TEMPLATES).map(([key, template]) => [key, template.description || '']));
    }
    estimateRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const plan = yield this.createOrchestrationPlan(request);
            // Generate alternatives
            const alternatives = yield Promise.all(Object.keys(WORKFLOW_TEMPLATES).map((templateKey) => __awaiter(this, void 0, void 0, function* () {
                if (templateKey === plan.workflowId)
                    return null;
                const altRequest = Object.assign({}, request);
                const altTemplate = WORKFLOW_TEMPLATES[templateKey];
                const altWorkflow = Object.assign(Object.assign({}, altTemplate), { id: `temp_${templateKey}`, version: '1.0', defaultTimeout: 300000, maxConcurrentSteps: 3, failureStrategy: 'continue-on-error', metadata: {} });
                const estimates = this.calculateWorkflowEstimates(altWorkflow);
                return {
                    template: templateKey,
                    cost: estimates.cost,
                    duration: estimates.duration
                };
            })));
            return {
                estimatedCost: plan.estimatedCost,
                estimatedDuration: plan.estimatedDuration,
                recommendedTemplate: plan.workflowId,
                alternatives: alternatives.filter(Boolean)
            };
        });
    }
    registerCustomAgent(agent) {
        this.registeredAgents.set(agent.agentType, agent);
        this.workflowEngine.registerAgent(agent);
        this.logger.info(`Custom agent registered: ${agent.agentType}`, {
            capabilities: agent.capabilities,
            cost: agent.costPerOperation,
            latency: agent.avgLatencyMs
        }, 'OrchestrationAgent');
    }
    getExecutionStatus(executionId) {
        return this.workflowEngine.getWorkflowStatus(executionId);
    }
    cancelExecution(executionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.workflowEngine.cancelExecution(executionId);
        });
    }
}
exports.OrchestrationAgent = OrchestrationAgent;
