"use strict";
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
exports.EvaluationAgent = void 0;
const MultiModelAI_1 = require("../services/MultiModelAI");
const errorHandling_1 = require("../utils/errorHandling");
const schemas_1 = require("../validation/schemas");
const zod_1 = require("zod");
// ============================================================================
// EVALUATION SCHEMAS
// ============================================================================
const EvaluationRequestSchema = zod_1.z.object({
    productAnalysisPackage: zod_1.z.object({
        executiveSummary: zod_1.z.string(),
        productRequirementsDocument: zod_1.z.any(),
        marketResearchReport: zod_1.z.any(),
        competitiveLandscapeAnalysis: zod_1.z.any(),
        prototypeSpecifications: zod_1.z.any().optional(),
        businessCase: zod_1.z.any().optional()
    }),
    evaluationModels: zod_1.z.array(zod_1.z.string()).min(1, "At least one evaluation model required"),
    scoringWeights: zod_1.z.object({
        contentQuality: zod_1.z.number().min(0).max(1),
        marketResearch: zod_1.z.number().min(0).max(1),
        strategicSoundness: zod_1.z.number().min(0).max(1),
        implementationReadiness: zod_1.z.number().min(0).max(1)
    }).optional()
});
// ============================================================================
// EVALUATION AGENT
// ============================================================================
class EvaluationAgent {
    constructor() {
        // Default scoring weights
        this.defaultWeights = {
            contentQuality: 0.40,
            marketResearch: 0.25,
            strategicSoundness: 0.20,
            implementationReadiness: 0.15
        };
        this.multiModelAI = new MultiModelAI_1.MultiModelAI();
        this.logger = errorHandling_1.Logger.getInstance();
    }
    evaluateProductAnalysis(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.logger.setContext(requestId);
            this.logger.info('Starting comprehensive product analysis evaluation', {
                inputKeys: Object.keys(input)
            }, 'EvaluationAgent');
            // Validate input
            const validationResult = (0, schemas_1.validateInput)(EvaluationRequestSchema, input, 'Evaluation Request');
            if (!validationResult.success) {
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.VALIDATION_ERROR, `Evaluation input validation failed: ${validationResult.error.message}`, 'Please check your evaluation request format.', { validationError: validationResult.error });
            }
            const validatedInput = validationResult.data;
            const productTitle = this.extractProductTitle(validatedInput.productAnalysisPackage);
            const scoringWeights = validatedInput.scoringWeights || this.defaultWeights;
            try {
                // Step 1: Run parallel evaluations across all models
                this.logger.info('Running parallel model evaluations', {
                    models: validatedInput.evaluationModels,
                    productTitle
                }, 'EvaluationAgent');
                const modelEvaluations = yield this.runParallelEvaluations(validatedInput.productAnalysisPackage, validatedInput.evaluationModels, scoringWeights);
                // Step 2: Generate consensus evaluation
                this.logger.info('Generating consensus evaluation', {
                    successfulEvaluations: Object.keys(modelEvaluations).length
                }, 'EvaluationAgent');
                const consensusEvaluation = this.generateConsensusEvaluation(modelEvaluations, scoringWeights);
                // Step 3: Create actionable recommendations
                const actionableRecommendations = this.generateActionableRecommendations(consensusEvaluation, modelEvaluations);
                // Step 4: Determine quality gates and next steps
                const qualityGates = this.assessQualityGates(consensusEvaluation);
                const nextSteps = this.generateNextSteps(consensusEvaluation, qualityGates);
                // Step 5: Compile final report
                const finalReport = {
                    timestamp: new Date().toISOString(),
                    productTitle,
                    evaluationSummary: {
                        overallScore: consensusEvaluation.consensusScore,
                        grade: this.calculateGrade(consensusEvaluation.consensusScore),
                        recommendation: this.generateRecommendation(consensusEvaluation.consensusScore, qualityGates)
                    },
                    modelEvaluations,
                    consensusEvaluation,
                    actionableRecommendations,
                    nextSteps,
                    qualityGates
                };
                this.logger.info('Product analysis evaluation completed', {
                    overallScore: consensusEvaluation.consensusScore,
                    grade: finalReport.evaluationSummary.grade,
                    recommendation: finalReport.evaluationSummary.recommendation,
                    modelsUsed: Object.keys(modelEvaluations).length
                }, 'EvaluationAgent');
                return finalReport;
            }
            catch (error) {
                this.logger.error('Product analysis evaluation failed', error, {
                    productTitle,
                    models: validatedInput.evaluationModels
                }, 'EvaluationAgent');
                if (error instanceof errorHandling_1.AgenticError) {
                    throw error;
                }
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.PROCESSING_ERROR, `Evaluation failed: ${error.message}`, 'Product analysis evaluation could not be completed. Please try again.', { productTitle, originalError: error.message }, true);
            }
        });
    }
    runParallelEvaluations(analysisPackage, models, weights) {
        return __awaiter(this, void 0, void 0, function* () {
            const evaluationPrompt = this.buildEvaluationPrompt(analysisPackage, weights);
            const multiModelRequest = {
                prompt: evaluationPrompt,
                models,
                systemPrompt: this.getEvaluationSystemPrompt(),
                temperature: 0.3,
                maxTokens: 4000
            };
            const multiModelResponse = yield this.multiModelAI.queryMultipleModels(multiModelRequest);
            const modelEvaluations = {};
            // Process each successful response
            for (const [modelName, response] of Object.entries(multiModelResponse.responses)) {
                try {
                    const evaluation = this.parseEvaluationResponse(response.content, modelName);
                    evaluation.executionTime = response.latency;
                    evaluation.cost = response.cost || 0;
                    modelEvaluations[modelName] = evaluation;
                    this.logger.debug(`Evaluation completed for ${modelName}`, {
                        score: evaluation.overallScore,
                        confidence: evaluation.confidence
                    }, 'EvaluationAgent');
                }
                catch (error) {
                    this.logger.warn(`Failed to parse evaluation from ${modelName}`, {
                        error: error.message,
                        responseLength: response.content.length
                    }, 'EvaluationAgent');
                }
            }
            // Log any failures
            for (const [modelName, error] of Object.entries(multiModelResponse.errors)) {
                this.logger.warn(`Model ${modelName} evaluation failed`, {
                    error: error.message
                }, 'EvaluationAgent');
            }
            if (Object.keys(modelEvaluations).length === 0) {
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.GENERATION_FAILED, 'All model evaluations failed', 'Unable to evaluate the product analysis. Please try again.', {
                    requestedModels: models,
                    errors: Object.keys(multiModelResponse.errors)
                }, true);
            }
            return modelEvaluations;
        });
    }
    buildEvaluationPrompt(analysisPackage, weights) {
        return `
You are an expert product management consultant tasked with comprehensively evaluating a product analysis package. 

ANALYSIS PACKAGE TO EVALUATE:
${JSON.stringify(analysisPackage, null, 2)}

EVALUATION CRITERIA AND WEIGHTS:
- Content Quality (${(weights.contentQuality * 100).toFixed(0)}%): Clarity, completeness, actionability
- Market Research (${(weights.marketResearch * 100).toFixed(0)}%): Data accuracy, insight depth, trend relevance  
- Strategic Soundness (${(weights.strategicSoundness * 100).toFixed(0)}%): Logical consistency, feasibility, risk assessment
- Implementation Readiness (${(weights.implementationReadiness * 100).toFixed(0)}%): Technical feasibility, resource estimates, timeline

EVALUATION INSTRUCTIONS:
1. Score each dimension from 0-100 (100 = exceptional, 80+ = good, 60-79 = acceptable, <60 = needs improvement)
2. Provide specific reasoning for each score
3. Identify 3-5 key strengths and weaknesses per dimension
4. Suggest 3-5 specific, actionable improvements per dimension
5. Assign an overall confidence level (0-100) in your evaluation

RESPONSE FORMAT (JSON):
{
  "overallScore": 85,
  "confidence": 90,
  "dimensions": {
    "contentQuality": {
      "score": 88,
      "reasoning": "Clear and well-structured analysis with actionable insights...",
      "strengths": ["Excellent executive summary", "Clear problem definition"],
      "weaknesses": ["Some sections lack specific metrics", "Could use more examples"],
      "improvements": ["Add quantified success metrics", "Include competitive benchmarks"]
    },
    "marketResearch": {
      "score": 82,
      "reasoning": "Solid market analysis with reasonable assumptions...",
      "strengths": ["Good TAM/SAM/SOM breakdown", "Relevant trend analysis"],
      "weaknesses": ["Limited primary research", "Some outdated data points"],
      "improvements": ["Conduct customer interviews", "Update market data"]
    },
    "strategicSoundness": {
      "score": 85,
      "reasoning": "Logical strategy with clear rationale...",
      "strengths": ["Well-defined value proposition", "Clear differentiation"],
      "weaknesses": ["Risk mitigation could be stronger", "Limited scenario planning"],
      "improvements": ["Develop contingency plans", "Add sensitivity analysis"]
    },
    "implementationReadiness": {
      "score": 78,
      "reasoning": "Generally feasible but some gaps in execution planning...",
      "strengths": ["Realistic timeline", "Clear resource requirements"],
      "weaknesses": ["Limited technical specifications", "Vague success metrics"],
      "improvements": ["Add detailed technical requirements", "Define KPI measurement"]
    }
  }
}

Provide thorough, specific, and actionable feedback that would help a product team improve their analysis.
`;
    }
    getEvaluationSystemPrompt() {
        return `You are a world-class product management consultant with 20+ years of experience evaluating product strategies for Fortune 500 companies and successful startups. 

Your expertise includes:
- Product strategy and market positioning
- Business model validation and monetization
- Technical feasibility assessment  
- Go-to-market strategy evaluation
- Risk assessment and mitigation
- Competitive analysis and differentiation

Evaluate with the rigor of a McKinsey consultant, the strategic insight of a successful CPO, and the practical wisdom of an experienced entrepreneur. Be thorough, specific, and actionable in your feedback.

Focus on providing insights that will genuinely help the product team succeed in the market.`;
    }
    parseEvaluationResponse(content, modelName) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/) ||
                content.match(/({[\s\S]*})/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[1]);
            // Validate required structure
            if (!parsed.overallScore || !parsed.confidence || !parsed.dimensions) {
                throw new Error('Missing required evaluation fields');
            }
            return {
                model: modelName,
                overallScore: Math.max(0, Math.min(100, parsed.overallScore)),
                confidence: Math.max(0, Math.min(100, parsed.confidence)),
                dimensions: {
                    contentQuality: this.validateDimension(parsed.dimensions.contentQuality),
                    marketResearch: this.validateDimension(parsed.dimensions.marketResearch),
                    strategicSoundness: this.validateDimension(parsed.dimensions.strategicSoundness),
                    implementationReadiness: this.validateDimension(parsed.dimensions.implementationReadiness)
                },
                executionTime: 0, // Will be set by caller
                cost: 0 // Will be set by caller
            };
        }
        catch (error) {
            throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.PROCESSING_ERROR, `Failed to parse evaluation from ${modelName}: ${error.message}`, `Unable to process evaluation from ${modelName}.`, { modelName, contentLength: content.length });
        }
    }
    validateDimension(dimension) {
        return {
            score: Math.max(0, Math.min(100, (dimension === null || dimension === void 0 ? void 0 : dimension.score) || 0)),
            reasoning: (dimension === null || dimension === void 0 ? void 0 : dimension.reasoning) || 'No reasoning provided',
            strengths: Array.isArray(dimension === null || dimension === void 0 ? void 0 : dimension.strengths) ? dimension.strengths : [],
            weaknesses: Array.isArray(dimension === null || dimension === void 0 ? void 0 : dimension.weaknesses) ? dimension.weaknesses : [],
            improvements: Array.isArray(dimension === null || dimension === void 0 ? void 0 : dimension.improvements) ? dimension.improvements : []
        };
    }
    generateConsensusEvaluation(modelEvaluations, weights) {
        const models = Object.keys(modelEvaluations);
        const evaluations = Object.values(modelEvaluations);
        // Calculate consensus scores
        const scores = evaluations.map(e => e.overallScore);
        const consensusScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        // Calculate agreement level (inverse of standard deviation)
        const variance = scores.reduce((acc, score) => acc + Math.pow(score - consensusScore, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance);
        const agreementLevel = Math.max(0, 100 - (stdDev * 2)); // Higher std dev = lower agreement
        // Find best and worst performing models
        const bestModel = models.reduce((best, current) => modelEvaluations[current].overallScore > modelEvaluations[best].overallScore ? current : best);
        const worstModel = models.reduce((worst, current) => modelEvaluations[current].overallScore < modelEvaluations[worst].overallScore ? current : worst);
        // Aggregate dimensions
        const aggregatedDimensions = this.aggregateDimensions(evaluations);
        // Identify disagreement areas
        const disagreementAreas = this.identifyDisagreementAreas(modelEvaluations);
        // Create model comparison
        const modelComparison = this.createModelComparison(modelEvaluations);
        return {
            consensusScore: Math.round(consensusScore),
            confidence: Math.round(evaluations.reduce((acc, e) => acc + e.confidence, 0) / evaluations.length),
            agreementLevel: Math.round(agreementLevel),
            bestModel,
            worstModel,
            aggregatedDimensions,
            disagreementAreas,
            modelComparison
        };
    }
    aggregateDimensions(evaluations) {
        const dimensions = ['contentQuality', 'marketResearch', 'strategicSoundness', 'implementationReadiness'];
        const result = {};
        for (const dimension of dimensions) {
            const scores = evaluations.map(e => e.dimensions[dimension].score);
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            // Aggregate strengths, weaknesses, and improvements
            const allStrengths = evaluations.flatMap(e => e.dimensions[dimension].strengths);
            const allWeaknesses = evaluations.flatMap(e => e.dimensions[dimension].weaknesses);
            const allImprovements = evaluations.flatMap(e => e.dimensions[dimension].improvements);
            result[dimension] = {
                score: Math.round(avgScore),
                reasoning: `Consensus view from ${evaluations.length} expert evaluations`,
                strengths: [...new Set(allStrengths)].slice(0, 5), // Top 5 unique strengths
                weaknesses: [...new Set(allWeaknesses)].slice(0, 5), // Top 5 unique weaknesses
                improvements: [...new Set(allImprovements)].slice(0, 8) // Top 8 unique improvements
            };
        }
        return result;
    }
    identifyDisagreementAreas(modelEvaluations) {
        const disagreements = [];
        const dimensions = ['contentQuality', 'marketResearch', 'strategicSoundness', 'implementationReadiness'];
        for (const dimension of dimensions) {
            const scores = Object.values(modelEvaluations).map(e => e.dimensions[dimension].score);
            const max = Math.max(...scores);
            const min = Math.min(...scores);
            if (max - min > 20) { // Significant disagreement threshold
                disagreements.push(`${dimension}: Score range ${min}-${max} indicates significant model disagreement`);
            }
        }
        return disagreements;
    }
    createModelComparison(modelEvaluations) {
        const models = Object.keys(modelEvaluations);
        const sortedModels = models.sort((a, b) => modelEvaluations[b].overallScore - modelEvaluations[a].overallScore);
        const comparison = {};
        sortedModels.forEach((model, index) => {
            const evaluation = modelEvaluations[model];
            comparison[model] = {
                score: evaluation.overallScore,
                rank: index + 1,
                strengths: this.extractModelStrengths(evaluation, modelEvaluations),
                uniqueInsights: this.extractUniqueInsights(model, evaluation, modelEvaluations)
            };
        });
        return comparison;
    }
    extractModelStrengths(evaluation, allEvaluations) {
        const strengths = [];
        // Find dimensions where this model scored highest
        const dimensions = ['contentQuality', 'marketResearch', 'strategicSoundness', 'implementationReadiness'];
        for (const dimension of dimensions) {
            const thisScore = evaluation.dimensions[dimension].score;
            const allScores = Object.values(allEvaluations).map(e => e.dimensions[dimension].score);
            const maxScore = Math.max(...allScores);
            if (thisScore === maxScore && thisScore > 80) {
                strengths.push(`Highest ${dimension} evaluation (${thisScore}/100)`);
            }
        }
        if (evaluation.confidence > 90) {
            strengths.push(`High confidence evaluation (${evaluation.confidence}%)`);
        }
        return strengths;
    }
    extractUniqueInsights(modelName, evaluation, allEvaluations) {
        // This is a simplified version - in a real implementation, you'd use NLP
        // to identify truly unique insights by comparing improvement suggestions
        const uniqueInsights = [];
        const allImprovements = Object.values(allEvaluations)
            .filter(e => e.model !== modelName)
            .flatMap(e => Object.values(e.dimensions).flatMap(d => d.improvements));
        const thisImprovements = Object.values(evaluation.dimensions).flatMap(d => d.improvements);
        for (const improvement of thisImprovements) {
            const isUnique = !allImprovements.some(other => improvement.toLowerCase().includes(other.toLowerCase().substring(0, 20)));
            if (isUnique) {
                uniqueInsights.push(improvement);
            }
        }
        return uniqueInsights.slice(0, 3); // Top 3 unique insights
    }
    generateActionableRecommendations(consensus, modelEvaluations) {
        const critical = [];
        const important = [];
        const suggestions = [];
        // Analyze each dimension for recommendations
        const dimensions = Object.entries(consensus.aggregatedDimensions);
        for (const [dimensionName, dimension] of dimensions) {
            if (dimension.score < 60) {
                // Critical issues (score < 60)
                dimension.improvements.forEach((improvement, index) => {
                    critical.push({
                        issue: `${dimensionName}: ${dimension.weaknesses[0] || 'Significant gaps identified'}`,
                        solution: improvement,
                        priority: 100 - dimension.score + index
                    });
                });
            }
            else if (dimension.score < 80) {
                // Important issues (score 60-79)
                dimension.improvements.slice(0, 3).forEach((improvement, index) => {
                    important.push({
                        issue: `${dimensionName}: Room for improvement`,
                        solution: improvement,
                        priority: 80 - dimension.score + index
                    });
                });
            }
            else {
                // Suggestions (score 80+)
                dimension.improvements.slice(0, 2).forEach((improvement, index) => {
                    suggestions.push({
                        issue: `${dimensionName}: Optimization opportunity`,
                        solution: improvement,
                        priority: index + 1
                    });
                });
            }
        }
        // Sort by priority
        critical.sort((a, b) => b.priority - a.priority);
        important.sort((a, b) => b.priority - a.priority);
        suggestions.sort((a, b) => b.priority - a.priority);
        return {
            critical: critical.slice(0, 5),
            important: important.slice(0, 8),
            suggestions: suggestions.slice(0, 10)
        };
    }
    assessQualityGates(consensus) {
        const passed = [];
        const failed = [];
        const warnings = [];
        // Define quality gates
        const gates = [
            { name: 'Overall Score', threshold: 70, score: consensus.consensusScore },
            { name: 'Content Quality', threshold: 75, score: consensus.aggregatedDimensions.contentQuality.score },
            { name: 'Market Research', threshold: 70, score: consensus.aggregatedDimensions.marketResearch.score },
            { name: 'Strategic Soundness', threshold: 75, score: consensus.aggregatedDimensions.strategicSoundness.score },
            { name: 'Implementation Readiness', threshold: 65, score: consensus.aggregatedDimensions.implementationReadiness.score },
            { name: 'Model Agreement', threshold: 70, score: consensus.agreementLevel }
        ];
        for (const gate of gates) {
            if (gate.score >= gate.threshold) {
                passed.push(`${gate.name}: ${gate.score}/100 (threshold: ${gate.threshold})`);
            }
            else if (gate.score >= gate.threshold - 10) {
                warnings.push(`${gate.name}: ${gate.score}/100 (threshold: ${gate.threshold}) - Close to threshold`);
            }
            else {
                failed.push(`${gate.name}: ${gate.score}/100 (threshold: ${gate.threshold}) - Below threshold`);
            }
        }
        return { passed, failed, warnings };
    }
    generateNextSteps(consensus, qualityGates) {
        const nextSteps = [];
        if (qualityGates.failed.length > 0) {
            nextSteps.push('Address critical quality gate failures before proceeding');
            nextSteps.push('Conduct focused analysis on lowest-scoring dimensions');
        }
        if (consensus.consensusScore >= 80) {
            nextSteps.push('Proceed with implementation planning');
            nextSteps.push('Begin stakeholder alignment and resource allocation');
        }
        else if (consensus.consensusScore >= 70) {
            nextSteps.push('Address identified improvements before proceeding');
            nextSteps.push('Consider additional market validation');
        }
        else {
            nextSteps.push('Significant revision required before implementation');
            nextSteps.push('Focus on fundamental strategy and market fit issues');
        }
        if (consensus.agreementLevel < 70) {
            nextSteps.push('Investigate areas of model disagreement for clarity');
            nextSteps.push('Consider additional expert review or validation');
        }
        nextSteps.push('Schedule follow-up evaluation after improvements');
        nextSteps.push('Document lessons learned for future analyses');
        return nextSteps;
    }
    calculateGrade(score) {
        if (score >= 95)
            return 'A+';
        if (score >= 90)
            return 'A';
        if (score >= 85)
            return 'B+';
        if (score >= 80)
            return 'B';
        if (score >= 75)
            return 'C+';
        if (score >= 70)
            return 'C';
        if (score >= 60)
            return 'D';
        return 'F';
    }
    generateRecommendation(score, qualityGates) {
        if (score >= 85 && qualityGates.failed.length === 0) {
            return 'Proceed Aggressively';
        }
        else if (score >= 75 && qualityGates.failed.length <= 1) {
            return 'Proceed with Caution';
        }
        else if (score >= 60) {
            return 'Revise Significantly';
        }
        else {
            return 'Restart Analysis';
        }
    }
    extractProductTitle(analysisPackage) {
        var _a, _b;
        // Try to extract product title from various sources
        if (analysisPackage.executiveSummary) {
            const titleMatch = analysisPackage.executiveSummary.match(/^(.+?)\s*[-–—]/);
            if (titleMatch)
                return titleMatch[1].trim();
        }
        if ((_a = analysisPackage.productRequirementsDocument) === null || _a === void 0 ? void 0 : _a.title) {
            return analysisPackage.productRequirementsDocument.title;
        }
        if ((_b = analysisPackage.productRequirementsDocument) === null || _b === void 0 ? void 0 : _b.product) {
            return analysisPackage.productRequirementsDocument.product;
        }
        return 'Unknown Product';
    }
    // Utility method to test evaluation with a sample
    testEvaluation() {
        return __awaiter(this, void 0, void 0, function* () {
            const samplePackage = {
                executiveSummary: "Test Product - A sample product for testing evaluation",
                productRequirementsDocument: { title: "Test Product", description: "Sample PRD" },
                marketResearchReport: { tam: 1000000000, sam: 100000000 },
                competitiveLandscapeAnalysis: { competitors: [] },
                prototypeSpecifications: { components: [] }
            };
            const availableModels = this.multiModelAI.getAvailableModels();
            if (availableModels.length === 0) {
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.AUTHENTICATION_ERROR, 'No AI models available for evaluation', 'Please configure API keys for OpenAI or Anthropic.');
            }
            return yield this.evaluateProductAnalysis({
                productAnalysisPackage: samplePackage,
                evaluationModels: availableModels.slice(0, 2) // Use first 2 available models
            });
        });
    }
}
exports.EvaluationAgent = EvaluationAgent;
