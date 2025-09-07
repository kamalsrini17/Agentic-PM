"use strict";
/**
 * Cost & Latency Optimized Evals Agent
 * Intelligent evaluation system that minimizes costs and latency while maximizing accuracy
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
exports.OptimizedEvalsAgent = void 0;
const errorHandling_1 = require("../utils/errorHandling");
const MultiModelAI_1 = require("../services/MultiModelAI");
const MetricsCollector_1 = require("../metrics/MetricsCollector");
const crypto_1 = require("crypto");
// ============================================================================
// OPTIMIZED EVALS AGENT
// ============================================================================
class OptimizedEvalsAgent {
    constructor() {
        // Performance tracking
        this.modelProfiles = new Map();
        this.evaluationCache = new Map();
        this.evaluationHistory = [];
        // Cost and performance tracking
        this.totalCostSpent = 0;
        this.totalEvaluations = 0;
        this.cacheHitRate = 0;
        // Optimization strategies
        this.FAST_EVALUATION_MODELS = ['gpt-3.5-turbo', 'claude-3-haiku-20240307'];
        this.ACCURATE_EVALUATION_MODELS = ['gpt-4-turbo-preview', 'claude-3-opus-20240229'];
        this.COST_EFFECTIVE_MODELS = ['gpt-3.5-turbo', 'claude-3-haiku-20240307'];
        this.multiModelAI = new MultiModelAI_1.MultiModelAI();
        this.metricsCollector = new MetricsCollector_1.MetricsCollector();
        this.logger = errorHandling_1.Logger.getInstance();
        this.initializeModelProfiles();
        this.setupPerformanceTracking();
        this.startCacheCleanup();
    }
    // ============================================================================
    // MAIN EVALUATION METHODS
    // ============================================================================
    evaluate(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const evaluationId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
            const startTime = Date.now();
            this.logger.setContext(evaluationId);
            this.logger.info('Starting optimized evaluation', {
                evaluationType: request.evaluationType,
                dimensions: request.dimensions,
                costBudget: request.config.costBudget,
                latencyTarget: request.config.latencyTarget
            }, 'OptimizedEvalsAgent');
            try {
                // 1. Check cache first
                const cacheResult = yield this.checkCache(request);
                if (cacheResult) {
                    const latency = Date.now() - startTime;
                    this.recordMetrics(cacheResult, latency, true);
                    this.logger.info('Cache hit - returning cached result', {
                        evaluationId,
                        cacheAge: Date.now() - cacheResult.timestamp.getTime()
                    }, 'OptimizedEvalsAgent');
                    return Object.assign(Object.assign({}, cacheResult), { evaluationId, actualLatency: latency, cacheHit: true, metadata: Object.assign(Object.assign({}, cacheResult.metadata), { timestamp: new Date() }) });
                }
                // 2. Determine optimization strategy
                const strategy = this.selectOptimizationStrategy(request);
                this.logger.info('Selected optimization strategy', {
                    strategy: strategy.name,
                    selectedModels: strategy.models,
                    estimatedCost: strategy.estimatedCost,
                    estimatedLatency: strategy.estimatedLatency
                }, 'OptimizedEvalsAgent');
                // 3. Execute optimized evaluation
                const result = yield this.executeOptimizedEvaluation(evaluationId, request, strategy);
                // 4. Cache result if beneficial
                if (((_a = request.config.caching) === null || _a === void 0 ? void 0 : _a.enabled) && this.shouldCache(result)) {
                    yield this.cacheResult(request, result);
                }
                // 5. Update model performance profiles
                this.updateModelProfiles(result);
                // 6. Record metrics
                const totalLatency = Date.now() - startTime;
                result.actualLatency = totalLatency;
                this.recordMetrics(result, totalLatency, false);
                this.logger.info('Optimized evaluation completed', {
                    evaluationId,
                    overallScore: result.overallScore,
                    actualCost: result.actualCost,
                    actualLatency: result.actualLatency,
                    budgetUtilization: result.metadata.budgetUtilization
                }, 'OptimizedEvalsAgent');
                return result;
            }
            catch (error) {
                const latency = Date.now() - startTime;
                this.logger.error('Optimized evaluation failed', error, {
                    evaluationId,
                    latency,
                    evaluationType: request.evaluationType
                }, 'OptimizedEvalsAgent');
                // Record failure metrics
                this.metricsCollector.recordMetric(MetricsCollector_1.BUSINESS_METRICS.ERROR_RATE, 1, 'count', {
                    component: 'OptimizedEvalsAgent',
                    error_type: 'evaluation_failure'
                });
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.PROCESSING_ERROR, `Optimized evaluation failed: ${error.message}`, 'The evaluation could not be completed. Please try again.', { evaluationId, evaluationType: request.evaluationType }, true);
            }
        });
    }
    // ============================================================================
    // OPTIMIZATION STRATEGY SELECTION
    // ============================================================================
    selectOptimizationStrategy(request) {
        const config = request.config;
        const priority = request.priority;
        const evaluationType = request.evaluationType;
        // Strategy 1: Cost-first optimization
        if (config.costBudget && config.costBudget < 0.10) {
            return this.createCostOptimizedStrategy(request);
        }
        // Strategy 2: Speed-first optimization
        if (config.latencyTarget && config.latencyTarget < 5000) {
            return this.createSpeedOptimizedStrategy(request);
        }
        // Strategy 3: Quality-first optimization
        if (config.qualityThreshold && config.qualityThreshold > 85) {
            return this.createQualityOptimizedStrategy(request);
        }
        // Strategy 4: Balanced optimization based on evaluation type
        switch (evaluationType) {
            case 'quick':
                return this.createSpeedOptimizedStrategy(request);
            case 'comprehensive':
                return this.createQualityOptimizedStrategy(request);
            default:
                return this.createBalancedStrategy(request);
        }
    }
    createCostOptimizedStrategy(request) {
        const models = this.selectModelsByPerformance('cost', request.dimensions);
        const estimatedCost = this.estimateTotalCost(models, request.dimensions);
        const estimatedLatency = this.estimateTotalLatency(models, false);
        return {
            name: 'cost-optimized',
            models,
            estimatedCost,
            estimatedLatency,
            rationale: 'Prioritizing cost efficiency while maintaining acceptable quality'
        };
    }
    createSpeedOptimizedStrategy(request) {
        const models = this.selectModelsByPerformance('speed', request.dimensions);
        const parallelizable = request.dimensions.length > 1;
        const estimatedCost = this.estimateTotalCost(models, request.dimensions);
        const estimatedLatency = this.estimateTotalLatency(models, parallelizable);
        return {
            name: 'speed-optimized',
            models,
            estimatedCost,
            estimatedLatency,
            rationale: 'Prioritizing low latency with parallel execution where possible'
        };
    }
    createQualityOptimizedStrategy(request) {
        const models = this.selectModelsByPerformance('accuracy', request.dimensions);
        const estimatedCost = this.estimateTotalCost(models, request.dimensions);
        const estimatedLatency = this.estimateTotalLatency(models, false);
        return {
            name: 'quality-optimized',
            models,
            estimatedCost,
            estimatedLatency,
            rationale: 'Prioritizing highest accuracy and comprehensive analysis'
        };
    }
    createBalancedStrategy(request) {
        // Mix of models based on dimension requirements
        const models = [];
        for (const dimension of request.dimensions) {
            const bestModel = this.selectBestModelForDimension(dimension, 'balanced');
            if (!models.includes(bestModel)) {
                models.push(bestModel);
            }
        }
        const estimatedCost = this.estimateTotalCost(models, request.dimensions);
        const estimatedLatency = this.estimateTotalLatency(models, true);
        return {
            name: 'balanced',
            models,
            estimatedCost,
            estimatedLatency,
            rationale: 'Balancing cost, speed, and quality based on dimension requirements'
        };
    }
    // ============================================================================
    // MODEL SELECTION AND PERFORMANCE
    // ============================================================================
    selectModelsByPerformance(optimizeFor, dimensions) {
        const availableModels = Array.from(this.modelProfiles.values());
        let sortedModels;
        switch (optimizeFor) {
            case 'cost':
                sortedModels = availableModels.sort((a, b) => a.avgCostPerRequest - b.avgCostPerRequest);
                break;
            case 'speed':
                sortedModels = availableModels.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
                break;
            case 'accuracy':
                sortedModels = availableModels.sort((a, b) => b.accuracyScore - a.accuracyScore);
                break;
        }
        // Select top models, ensuring we have at least one for each dimension
        const selectedModels = [];
        const maxModels = Math.min(3, dimensions.length);
        for (let i = 0; i < maxModels && i < sortedModels.length; i++) {
            selectedModels.push(sortedModels[i].modelName);
        }
        return selectedModels.length > 0 ? selectedModels : ['gpt-3.5-turbo']; // Fallback
    }
    selectBestModelForDimension(dimension, strategy) {
        const dimensionModelMap = {
            'content-quality': ['gpt-4-turbo-preview', 'claude-3-opus-20240229'],
            'market-research': ['gpt-4-turbo-preview', 'claude-3-sonnet-20240229'],
            'strategic-soundness': ['claude-3-opus-20240229', 'gpt-4-turbo-preview'],
            'implementation-readiness': ['gpt-3.5-turbo', 'claude-3-haiku-20240307'],
            'technical-feasibility': ['gpt-4-turbo-preview', 'claude-3-sonnet-20240229']
        };
        const preferredModels = dimensionModelMap[dimension] || ['gpt-3.5-turbo'];
        // Return the first available model from preferred list
        for (const model of preferredModels) {
            if (this.modelProfiles.has(model)) {
                return model;
            }
        }
        return 'gpt-3.5-turbo'; // Ultimate fallback
    }
    estimateTotalCost(models, dimensions) {
        let totalCost = 0;
        for (const modelName of models) {
            const profile = this.modelProfiles.get(modelName);
            if (profile) {
                // Estimate cost per dimension
                totalCost += profile.avgCostPerRequest * dimensions.length;
            }
        }
        return totalCost;
    }
    estimateTotalLatency(models, parallelizable) {
        if (models.length === 0)
            return 0;
        const latencies = models.map(modelName => {
            const profile = this.modelProfiles.get(modelName);
            return profile ? profile.avgLatencyMs : 3000; // Default 3s
        });
        return parallelizable ? Math.max(...latencies) : latencies.reduce((a, b) => a + b, 0);
    }
    // ============================================================================
    // EXECUTION ENGINE
    // ============================================================================
    executeOptimizedEvaluation(evaluationId, request, strategy) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            let actualCost = 0;
            const dimensionScores = {};
            const modelsUsed = [];
            const fallbacksUsed = [];
            // Execute evaluation for each dimension
            for (const dimension of request.dimensions) {
                try {
                    const bestModel = this.selectBestModelForDimension(dimension, 'balanced');
                    if (!strategy.models.includes(bestModel) && strategy.models.length > 0) {
                        // Use strategy model if available
                        const modelToUse = strategy.models[0];
                        const result = yield this.evaluateDimension(dimension, request.content, modelToUse, request.config);
                        dimensionScores[dimension] = result;
                        actualCost += result.cost;
                        if (!modelsUsed.includes(modelToUse)) {
                            modelsUsed.push(modelToUse);
                        }
                    }
                    else {
                        // Use best model for dimension
                        const result = yield this.evaluateDimension(dimension, request.content, bestModel, request.config);
                        dimensionScores[dimension] = result;
                        actualCost += result.cost;
                        if (!modelsUsed.includes(bestModel)) {
                            modelsUsed.push(bestModel);
                        }
                    }
                    // Check budget constraints
                    if (request.config.costBudget && actualCost > request.config.costBudget) {
                        this.logger.warn('Cost budget exceeded, switching to fallback strategy', {
                            actualCost,
                            budget: request.config.costBudget,
                            dimension
                        }, 'OptimizedEvalsAgent');
                        fallbacksUsed.push('cost-budget-exceeded');
                        break; // Stop further evaluation
                    }
                    // Check latency constraints
                    const currentLatency = Date.now() - startTime;
                    if (request.config.latencyTarget && currentLatency > request.config.latencyTarget) {
                        this.logger.warn('Latency target exceeded, stopping evaluation', {
                            currentLatency,
                            target: request.config.latencyTarget,
                            dimension
                        }, 'OptimizedEvalsAgent');
                        fallbacksUsed.push('latency-target-exceeded');
                        break; // Stop further evaluation
                    }
                }
                catch (error) {
                    this.logger.warn(`Failed to evaluate dimension ${dimension}`, {
                        error: error.message
                    }, 'OptimizedEvalsAgent');
                    // Use fallback scoring
                    dimensionScores[dimension] = {
                        score: 50, // Neutral score
                        confidence: 30,
                        reasoning: `Evaluation failed: ${error.message}`,
                        model: 'fallback',
                        cost: 0
                    };
                    fallbacksUsed.push(`dimension-${dimension}-failed`);
                }
            }
            // Calculate overall score
            const scores = Object.values(dimensionScores).map((d) => d.score);
            const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            // Calculate overall confidence
            const confidences = Object.values(dimensionScores).map((d) => d.confidence);
            const overallConfidence = confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;
            // Generate recommendations
            const recommendations = this.generateOptimizedRecommendations(dimensionScores, request);
            const result = {
                evaluationId,
                overallScore: Math.round(overallScore),
                confidence: Math.round(overallConfidence),
                actualCost,
                actualLatency: Date.now() - startTime,
                modelsUsed,
                cacheHit: false,
                optimizationStrategy: strategy.name,
                dimensionScores,
                recommendations,
                metadata: {
                    timestamp: new Date(),
                    evaluationType: request.evaluationType,
                    budgetUtilization: request.config.costBudget ? (actualCost / request.config.costBudget) * 100 : 0,
                    qualityAchieved: Math.round(overallScore),
                    fallbacksUsed
                }
            };
            return result;
        });
    }
    evaluateDimension(dimension, content, modelName, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = this.buildDimensionPrompt(dimension, content);
            const startTime = Date.now();
            try {
                const response = yield this.multiModelAI.queryMultipleModels({
                    prompt,
                    models: [modelName],
                    systemPrompt: this.getDimensionSystemPrompt(dimension),
                    temperature: 0.3,
                    maxTokens: 1000 // Optimized for cost
                });
                const modelResponse = response.responses[modelName];
                if (!modelResponse) {
                    throw new Error(`No response from model ${modelName}`);
                }
                const parsed = this.parseDimensionResponse(modelResponse.content);
                const latency = Date.now() - startTime;
                const cost = modelResponse.cost || this.estimateModelCost(modelName, prompt.length);
                // Update model performance
                this.updateModelPerformance(modelName, cost, latency, parsed.score > 70);
                return {
                    score: parsed.score,
                    confidence: parsed.confidence,
                    reasoning: parsed.reasoning,
                    model: modelName,
                    cost
                };
            }
            catch (error) {
                this.logger.warn(`Dimension evaluation failed for ${dimension}`, {
                    model: modelName,
                    error: error.message
                }, 'OptimizedEvalsAgent');
                throw error;
            }
        });
    }
    // ============================================================================
    // CACHING SYSTEM
    // ============================================================================
    checkCache(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!((_a = request.config.caching) === null || _a === void 0 ? void 0 : _a.enabled))
                return null;
            const contentHash = this.generateContentHash(request);
            const cached = this.evaluationCache.get(contentHash);
            if (!cached)
                return null;
            // Check TTL
            const ttlMs = (request.config.caching.ttlHours || 24) * 60 * 60 * 1000;
            const isExpired = Date.now() - cached.timestamp.getTime() > ttlMs;
            if (isExpired) {
                this.evaluationCache.delete(contentHash);
                return null;
            }
            // Update access tracking
            cached.accessCount++;
            cached.lastAccessed = new Date();
            // Update cache hit rate
            this.updateCacheMetrics(true);
            return cached.result;
        });
    }
    cacheResult(request, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const contentHash = this.generateContentHash(request);
            const cacheEntry = {
                contentHash,
                result,
                timestamp: new Date(),
                accessCount: 1,
                lastAccessed: new Date()
            };
            this.evaluationCache.set(contentHash, cacheEntry);
            // Limit cache size
            if (this.evaluationCache.size > 1000) {
                this.cleanupCache();
            }
            this.logger.debug('Result cached', {
                contentHash: contentHash.substring(0, 8),
                cacheSize: this.evaluationCache.size
            }, 'OptimizedEvalsAgent');
        });
    }
    shouldCache(result) {
        // Cache if evaluation was successful and not too cheap (avoid caching trivial evaluations)
        return result.overallScore > 0 &&
            result.actualCost > 0.01 &&
            result.confidence > 50;
    }
    generateContentHash(request) {
        const hashInput = JSON.stringify({
            content: request.content,
            dimensions: request.dimensions.sort(),
            evaluationType: request.evaluationType
        });
        return (0, crypto_1.createHash)('sha256').update(hashInput).digest('hex');
    }
    cleanupCache() {
        // Remove least recently used entries
        const entries = Array.from(this.evaluationCache.entries());
        entries.sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());
        // Remove oldest 20%
        const toRemove = Math.floor(entries.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
            this.evaluationCache.delete(entries[i][0]);
        }
        this.logger.debug('Cache cleanup completed', {
            removedEntries: toRemove,
            remainingEntries: this.evaluationCache.size
        }, 'OptimizedEvalsAgent');
    }
    // ============================================================================
    // PERFORMANCE TRACKING AND OPTIMIZATION
    // ============================================================================
    initializeModelProfiles() {
        const defaultProfiles = [
            {
                modelName: 'gpt-3.5-turbo',
                avgCostPerRequest: 0.002,
                avgLatencyMs: 1500,
                accuracyScore: 75,
                reliabilityScore: 95,
                tokensPerDollar: 500000,
                specialties: ['general', 'fast', 'cost-effective'],
                lastUpdated: new Date()
            },
            {
                modelName: 'gpt-4-turbo-preview',
                avgCostPerRequest: 0.03,
                avgLatencyMs: 3000,
                accuracyScore: 90,
                reliabilityScore: 98,
                tokensPerDollar: 33333,
                specialties: ['accuracy', 'reasoning', 'complex-analysis'],
                lastUpdated: new Date()
            },
            {
                modelName: 'claude-3-haiku-20240307',
                avgCostPerRequest: 0.001,
                avgLatencyMs: 1200,
                accuracyScore: 70,
                reliabilityScore: 94,
                tokensPerDollar: 1000000,
                specialties: ['fast', 'cost-effective', 'basic-analysis'],
                lastUpdated: new Date()
            },
            {
                modelName: 'claude-3-sonnet-20240229',
                avgCostPerRequest: 0.015,
                avgLatencyMs: 2500,
                accuracyScore: 85,
                reliabilityScore: 96,
                tokensPerDollar: 66666,
                specialties: ['balanced', 'analysis', 'reasoning'],
                lastUpdated: new Date()
            },
            {
                modelName: 'claude-3-opus-20240229',
                avgCostPerRequest: 0.075,
                avgLatencyMs: 4000,
                accuracyScore: 95,
                reliabilityScore: 98,
                tokensPerDollar: 13333,
                specialties: ['accuracy', 'complex-reasoning', 'comprehensive'],
                lastUpdated: new Date()
            }
        ];
        for (const profile of defaultProfiles) {
            this.modelProfiles.set(profile.modelName, profile);
        }
        this.logger.info('Initialized model performance profiles', {
            profilesCount: defaultProfiles.length
        }, 'OptimizedEvalsAgent');
    }
    updateModelPerformance(modelName, cost, latency, success) {
        const profile = this.modelProfiles.get(modelName);
        if (!profile)
            return;
        // Update with exponential moving average
        const alpha = 0.1; // Learning rate
        profile.avgCostPerRequest = (1 - alpha) * profile.avgCostPerRequest + alpha * cost;
        profile.avgLatencyMs = (1 - alpha) * profile.avgLatencyMs + alpha * latency;
        profile.reliabilityScore = (1 - alpha) * profile.reliabilityScore + alpha * (success ? 100 : 0);
        profile.lastUpdated = new Date();
        this.modelProfiles.set(modelName, profile);
    }
    updateModelProfiles(result) {
        // Update profiles based on evaluation results
        for (const [dimension, dimensionResult] of Object.entries(result.dimensionScores)) {
            const modelName = dimensionResult.model;
            if (modelName === 'fallback')
                continue;
            const profile = this.modelProfiles.get(modelName);
            if (profile) {
                // Update accuracy based on confidence and score
                const performanceScore = (dimensionResult.score + dimensionResult.confidence) / 2;
                const alpha = 0.05;
                profile.accuracyScore = (1 - alpha) * profile.accuracyScore + alpha * performanceScore;
                profile.lastUpdated = new Date();
                this.modelProfiles.set(modelName, profile);
            }
        }
    }
    // ============================================================================
    // PROMPT OPTIMIZATION
    // ============================================================================
    buildDimensionPrompt(dimension, content) {
        const prompts = {
            'content-quality': `
Evaluate the content quality of this product analysis:

${JSON.stringify(content, null, 2)}

Rate on a scale of 0-100 considering:
- Clarity and readability
- Completeness of information
- Actionability of insights
- Professional presentation

Respond with JSON: {"score": number, "confidence": number, "reasoning": "brief explanation"}
`,
            'market-research': `
Evaluate the market research quality:

${JSON.stringify(content, null, 2)}

Rate on a scale of 0-100 considering:
- Data accuracy and sources
- Market sizing methodology
- Competitive analysis depth
- Trend identification

Respond with JSON: {"score": number, "confidence": number, "reasoning": "brief explanation"}
`,
            'strategic-soundness': `
Evaluate the strategic soundness:

${JSON.stringify(content, null, 2)}

Rate on a scale of 0-100 considering:
- Logical consistency
- Strategic rationale
- Risk assessment
- Feasibility

Respond with JSON: {"score": number, "confidence": number, "reasoning": "brief explanation"}
`,
            'implementation-readiness': `
Evaluate implementation readiness:

${JSON.stringify(content, null, 2)}

Rate on a scale of 0-100 considering:
- Technical feasibility
- Resource requirements
- Timeline realism
- Success metrics

Respond with JSON: {"score": number, "confidence": number, "reasoning": "brief explanation"}
`
        };
        return prompts[dimension] || prompts['content-quality'];
    }
    getDimensionSystemPrompt(dimension) {
        return `You are an expert product management consultant specializing in ${dimension} evaluation. 
Provide concise, actionable feedback with specific scores and reasoning. 
Focus on practical insights that help improve the analysis.`;
    }
    parseDimensionResponse(content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    score: Math.max(0, Math.min(100, parsed.score || 0)),
                    confidence: Math.max(0, Math.min(100, parsed.confidence || 50)),
                    reasoning: parsed.reasoning || 'No reasoning provided'
                };
            }
        }
        catch (error) {
            this.logger.warn('Failed to parse dimension response', {
                error: error.message,
                content: content.substring(0, 100)
            }, 'OptimizedEvalsAgent');
        }
        // Fallback parsing
        return {
            score: 50,
            confidence: 30,
            reasoning: 'Failed to parse response properly'
        };
    }
    // ============================================================================
    // RECOMMENDATIONS ENGINE
    // ============================================================================
    generateOptimizedRecommendations(dimensionScores, request) {
        const recommendations = [];
        // Analyze each dimension for recommendations
        for (const [dimension, result] of Object.entries(dimensionScores)) {
            if (result.score < 70) {
                recommendations.push({
                    category: dimension,
                    suggestion: `Improve ${dimension}: ${result.reasoning}`,
                    impact: result.score < 50 ? 'high' : 'medium',
                    effort: 'medium'
                });
            }
        }
        // Add cost optimization recommendations
        if (request.config.costBudget) {
            const avgCostPerDimension = Object.values(dimensionScores)
                .reduce((sum, d) => sum + (d.cost || 0), 0) / request.dimensions.length;
            if (avgCostPerDimension > request.config.costBudget * 0.8) {
                recommendations.push({
                    category: 'cost-optimization',
                    suggestion: 'Consider using more cost-effective models for basic evaluations',
                    impact: 'medium',
                    effort: 'low'
                });
            }
        }
        // Add performance recommendations
        const lowConfidenceScores = Object.values(dimensionScores).filter((d) => d.confidence < 60);
        if (lowConfidenceScores.length > 0) {
            recommendations.push({
                category: 'evaluation-quality',
                suggestion: 'Some evaluations have low confidence - consider using higher-accuracy models',
                impact: 'medium',
                effort: 'medium'
            });
        }
        return recommendations.slice(0, 8); // Limit to top 8 recommendations
    }
    // ============================================================================
    // METRICS AND MONITORING
    // ============================================================================
    recordMetrics(result, latency, cacheHit) {
        // Record core metrics
        this.metricsCollector.recordMetric(MetricsCollector_1.BUSINESS_METRICS.AI_COST_PER_REQUEST, result.actualCost, '$', { component: 'OptimizedEvalsAgent' });
        this.metricsCollector.recordMetric(MetricsCollector_1.BUSINESS_METRICS.AI_LATENCY, latency, 'ms', { component: 'OptimizedEvalsAgent', cache_hit: cacheHit.toString() });
        this.metricsCollector.recordMetric(MetricsCollector_1.BUSINESS_METRICS.AI_SUCCESS_RATE, result.overallScore > 0 ? 100 : 0, '%', { component: 'OptimizedEvalsAgent' });
        // Record optimization metrics
        this.metricsCollector.recordMetric('evaluation.budget_utilization', result.metadata.budgetUtilization, '%', { strategy: result.optimizationStrategy });
        this.metricsCollector.recordMetric('evaluation.quality_achieved', result.metadata.qualityAchieved, 'score', { strategy: result.optimizationStrategy });
        // Update totals
        this.totalCostSpent += result.actualCost;
        this.totalEvaluations++;
        this.updateCacheMetrics(cacheHit);
    }
    updateCacheMetrics(cacheHit) {
        const alpha = 0.1;
        this.cacheHitRate = (1 - alpha) * this.cacheHitRate + alpha * (cacheHit ? 100 : 0);
        this.metricsCollector.recordMetric('evaluation.cache_hit_rate', this.cacheHitRate, '%', { component: 'OptimizedEvalsAgent' });
    }
    setupPerformanceTracking() {
        // Track performance metrics every 5 minutes
        setInterval(() => {
            this.recordPerformanceMetrics();
        }, 5 * 60 * 1000);
        this.logger.info('Performance tracking initialized', {
            interval: '5 minutes'
        }, 'OptimizedEvalsAgent');
    }
    recordPerformanceMetrics() {
        // Record aggregate metrics
        this.metricsCollector.recordMetric('evaluation.total_cost_spent', this.totalCostSpent, '$', { component: 'OptimizedEvalsAgent' });
        this.metricsCollector.recordMetric('evaluation.total_evaluations', this.totalEvaluations, 'count', { component: 'OptimizedEvalsAgent' });
        this.metricsCollector.recordMetric('evaluation.avg_cost_per_evaluation', this.totalEvaluations > 0 ? this.totalCostSpent / this.totalEvaluations : 0, '$', { component: 'OptimizedEvalsAgent' });
        // Record cache metrics
        this.metricsCollector.recordMetric('evaluation.cache_size', this.evaluationCache.size, 'count', { component: 'OptimizedEvalsAgent' });
        // Record model performance
        for (const [modelName, profile] of this.modelProfiles.entries()) {
            this.metricsCollector.recordMetric('model.avg_cost', profile.avgCostPerRequest, '$', { model: modelName });
            this.metricsCollector.recordMetric('model.avg_latency', profile.avgLatencyMs, 'ms', { model: modelName });
            this.metricsCollector.recordMetric('model.accuracy_score', profile.accuracyScore, 'score', { model: modelName });
        }
    }
    startCacheCleanup() {
        // Clean up cache every hour
        setInterval(() => {
            this.cleanupCache();
        }, 60 * 60 * 1000);
        this.logger.info('Cache cleanup scheduled', {
            interval: '1 hour'
        }, 'OptimizedEvalsAgent');
    }
    estimateModelCost(modelName, promptLength) {
        const profile = this.modelProfiles.get(modelName);
        if (!profile)
            return 0.01; // Default cost
        // Rough estimation based on tokens
        const estimatedTokens = Math.ceil(promptLength / 4); // ~4 chars per token
        return (estimatedTokens / profile.tokensPerDollar) * 1.5; // Add buffer
    }
    // ============================================================================
    // PUBLIC UTILITY METHODS
    // ============================================================================
    getModelProfiles() {
        return Array.from(this.modelProfiles.values());
    }
    getCacheStats() {
        return {
            size: this.evaluationCache.size,
            hitRate: this.cacheHitRate,
            totalCost: this.totalCostSpent,
            totalEvaluations: this.totalEvaluations,
            avgCostPerEvaluation: this.totalEvaluations > 0 ? this.totalCostSpent / this.totalEvaluations : 0
        };
    }
    clearCache() {
        this.evaluationCache.clear();
        this.logger.info('Evaluation cache cleared', {}, 'OptimizedEvalsAgent');
    }
    quickEvaluate(content_1) {
        return __awaiter(this, arguments, void 0, function* (content, dimensions = ['content-quality']) {
            return this.evaluate({
                content,
                evaluationType: 'quick',
                dimensions,
                config: {
                    costBudget: 0.05,
                    latencyTarget: 3000,
                    caching: { enabled: true },
                    fallbackStrategy: 'speed'
                },
                priority: 'high'
            });
        });
    }
    comprehensiveEvaluate(content) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.evaluate({
                content,
                evaluationType: 'comprehensive',
                dimensions: ['content-quality', 'market-research', 'strategic-soundness', 'implementation-readiness'],
                config: {
                    qualityThreshold: 85,
                    caching: { enabled: true, ttlHours: 48 },
                    fallbackStrategy: 'quality'
                },
                priority: 'normal'
            });
        });
    }
    getPerformanceReport() {
        const cacheStats = this.getCacheStats();
        const modelPerformance = this.getModelProfiles();
        const recommendations = [];
        // Generate optimization recommendations
        if (cacheStats.hitRate < 30) {
            recommendations.push('Consider enabling caching more aggressively to reduce costs');
        }
        if (cacheStats.avgCostPerEvaluation > 0.10) {
            recommendations.push('Average cost per evaluation is high - consider using more cost-effective models');
        }
        const slowModels = modelPerformance.filter(m => m.avgLatencyMs > 5000);
        if (slowModels.length > 0) {
            recommendations.push(`Consider replacing slow models: ${slowModels.map(m => m.modelName).join(', ')}`);
        }
        return {
            summary: {
                totalEvaluations: cacheStats.totalEvaluations,
                totalCostSpent: cacheStats.totalCost,
                avgCostPerEvaluation: cacheStats.avgCostPerEvaluation,
                cacheHitRate: cacheStats.hitRate,
                modelsTracked: modelPerformance.length
            },
            modelPerformance,
            cacheStats,
            recommendations
        };
    }
}
exports.OptimizedEvalsAgent = OptimizedEvalsAgent;
