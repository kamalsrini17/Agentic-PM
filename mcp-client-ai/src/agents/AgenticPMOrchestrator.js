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
exports.AgenticPMOrchestrator = void 0;
const MarketResearchAgent_1 = require("./MarketResearchAgent");
const CompetitiveLandscapeAgent_1 = require("./CompetitiveLandscapeAgent");
const PrototypeGeneratorAgent_1 = require("./PrototypeGeneratorAgent");
const DocumentPackageAgent_1 = require("./DocumentPackageAgent");
const EvaluationAgent_1 = require("./EvaluationAgent");
const MultiModelAI_1 = require("../services/MultiModelAI");
const schemas_1 = require("../validation/schemas");
const errorHandling_1 = require("../utils/errorHandling");
const openai_1 = require("openai");
// ============================================================================
// AGENTIC PM ORCHESTRATOR
// ============================================================================
class AgenticPMOrchestrator {
    constructor() {
        this.logger = errorHandling_1.Logger.getInstance();
        // Initialize OpenAI
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.AUTHENTICATION_ERROR, 'OPENAI_API_KEY environment variable is required', 'OpenAI API key is not configured. Please contact support.');
        }
        this.openai = new openai_1.OpenAI({ apiKey: openaiApiKey });
        // Initialize agents
        this.marketResearchAgent = new MarketResearchAgent_1.MarketResearchAgent(this.openai);
        this.competitiveLandscapeAgent = new CompetitiveLandscapeAgent_1.CompetitiveLandscapeAgent(this.openai);
        this.prototypeGeneratorAgent = new PrototypeGeneratorAgent_1.PrototypeGeneratorAgent(this.openai, './prototypes');
        this.documentPackageAgent = new DocumentPackageAgent_1.DocumentPackageAgent(this.openai, './documents');
        this.evaluationAgent = new EvaluationAgent_1.EvaluationAgent();
        this.multiModelAI = new MultiModelAI_1.MultiModelAI();
    }
    runCompleteWorkflow(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const requestId = `apm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const startTime = new Date();
            this.logger.setContext(requestId);
            this.logger.info('Starting Agentic PM workflow', {
                productTitle: request.productConcept.title,
                workflowOptions: request.workflowOptions
            }, 'AgenticPMOrchestrator');
            // Validate input
            const validationResult = this.validateProductConcept(request.productConcept);
            if (!validationResult.success) {
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.VALIDATION_ERROR, `Product concept validation failed: ${validationResult.error.message}`, 'Please check your product concept format.', { validationError: validationResult.error });
            }
            const validatedConcept = validationResult.data;
            const options = this.getDefaultWorkflowOptions(request.workflowOptions);
            const result = {
                requestId,
                productTitle: validatedConcept.title,
                executiveSummary: '',
                workflowMetadata: {
                    startTime: startTime.toISOString(),
                    endTime: '',
                    duration: 0,
                    stepsCompleted: [],
                    stepsSkipped: [],
                    errors: [],
                    warnings: []
                }
            };
            try {
                // Step 1: Generate PRD
                this.logger.info('Generating Product Requirements Document', {
                    productTitle: validatedConcept.title
                }, 'AgenticPMOrchestrator');
                result.productRequirementsDocument = yield this.generatePRD(validatedConcept, request.userPreferences);
                result.workflowMetadata.stepsCompleted.push('PRD Generation');
                // Step 2: Market Research (optional)
                if (options.includeMarketResearch) {
                    this.logger.info('Conducting market research analysis', {
                        productTitle: validatedConcept.title
                    }, 'AgenticPMOrchestrator');
                    try {
                        result.marketResearchReport = yield this.marketResearchAgent.conductMarketResearch({
                            productTitle: validatedConcept.title,
                            productDescription: validatedConcept.description,
                            targetMarket: validatedConcept.targetMarket,
                            geography: 'Global'
                        });
                        result.workflowMetadata.stepsCompleted.push('Market Research');
                    }
                    catch (error) {
                        this.logger.warn('Market research failed, continuing without it', {
                            error: error.message
                        }, 'AgenticPMOrchestrator');
                        result.workflowMetadata.errors.push({ step: 'Market Research', error: error.message });
                        result.workflowMetadata.stepsSkipped.push('Market Research');
                    }
                }
                else {
                    result.workflowMetadata.stepsSkipped.push('Market Research');
                }
                // Step 3: Competitive Analysis (optional)
                if (options.includeCompetitiveAnalysis) {
                    this.logger.info('Analyzing competitive landscape', {
                        productTitle: validatedConcept.title
                    }, 'AgenticPMOrchestrator');
                    try {
                        result.competitiveLandscapeAnalysis = yield this.competitiveLandscapeAgent.analyzeCompetitiveLandscape({
                            productTitle: validatedConcept.title,
                            productDescription: validatedConcept.description,
                            targetMarket: validatedConcept.targetMarket,
                            geography: 'Global'
                        });
                        result.workflowMetadata.stepsCompleted.push('Competitive Analysis');
                    }
                    catch (error) {
                        this.logger.warn('Competitive analysis failed, continuing without it', {
                            error: error.message
                        }, 'AgenticPMOrchestrator');
                        result.workflowMetadata.errors.push({ step: 'Competitive Analysis', error: error.message });
                        result.workflowMetadata.stepsSkipped.push('Competitive Analysis');
                    }
                }
                else {
                    result.workflowMetadata.stepsSkipped.push('Competitive Analysis');
                }
                // Step 4: Prototype Generation (optional)
                if (options.includePrototype) {
                    this.logger.info('Generating prototype specifications', {
                        productTitle: validatedConcept.title
                    }, 'AgenticPMOrchestrator');
                    try {
                        const prototypeRequirements = this.buildPrototypeRequirements(validatedConcept);
                        result.prototypeSpecifications = yield this.prototypeGeneratorAgent.generatePrototype(prototypeRequirements);
                        result.workflowMetadata.stepsCompleted.push('Prototype Generation');
                    }
                    catch (error) {
                        this.logger.warn('Prototype generation failed, continuing without it', {
                            error: error.message
                        }, 'AgenticPMOrchestrator');
                        result.workflowMetadata.errors.push({ step: 'Prototype Generation', error: error.message });
                        result.workflowMetadata.stepsSkipped.push('Prototype Generation');
                    }
                }
                else {
                    result.workflowMetadata.stepsSkipped.push('Prototype Generation');
                }
                // Step 5: Business Case Generation
                this.logger.info('Generating business case', {
                    productTitle: validatedConcept.title
                }, 'AgenticPMOrchestrator');
                result.businessCase = yield this.generateBusinessCase(validatedConcept, result);
                result.workflowMetadata.stepsCompleted.push('Business Case');
                // Step 6: Executive Summary Generation
                this.logger.info('Generating executive summary', {
                    productTitle: validatedConcept.title
                }, 'AgenticPMOrchestrator');
                result.executiveSummary = yield this.generateExecutiveSummary(validatedConcept, result);
                result.workflowMetadata.stepsCompleted.push('Executive Summary');
                // Step 7: Evaluation (optional)
                if (options.includeEvaluation && options.evaluationModels && options.evaluationModels.length > 0) {
                    this.logger.info('Running multi-model evaluation', {
                        productTitle: validatedConcept.title,
                        models: options.evaluationModels
                    }, 'AgenticPMOrchestrator');
                    try {
                        result.evaluationReport = yield this.evaluationAgent.evaluateProductAnalysis({
                            productAnalysisPackage: {
                                executiveSummary: result.executiveSummary,
                                productRequirementsDocument: result.productRequirementsDocument,
                                marketResearchReport: result.marketResearchReport,
                                competitiveLandscapeAnalysis: result.competitiveLandscapeAnalysis,
                                prototypeSpecifications: result.prototypeSpecifications,
                                businessCase: result.businessCase
                            },
                            evaluationModels: options.evaluationModels
                        });
                        result.workflowMetadata.stepsCompleted.push('Multi-Model Evaluation');
                    }
                    catch (error) {
                        this.logger.warn('Evaluation failed, continuing without it', {
                            error: error.message
                        }, 'AgenticPMOrchestrator');
                        result.workflowMetadata.errors.push({ step: 'Evaluation', error: error.message });
                        result.workflowMetadata.stepsSkipped.push('Evaluation');
                    }
                }
                else {
                    result.workflowMetadata.stepsSkipped.push('Multi-Model Evaluation');
                }
                // Step 8: Document Package Generation (optional)
                if (options.exportFormat) {
                    this.logger.info('Generating document package', {
                        productTitle: validatedConcept.title,
                        format: options.exportFormat
                    }, 'AgenticPMOrchestrator');
                    try {
                        const documentPackage = yield this.documentPackageAgent.createComprehensivePackage(validatedConcept.title, {
                            prd: result.productRequirementsDocument,
                            marketResearch: result.marketResearchReport,
                            competitiveLandscape: result.competitiveLandscapeAnalysis,
                            prototype: result.prototypeSpecifications
                        }, {
                            format: options.exportFormat,
                            template: ((_a = request.userPreferences) === null || _a === void 0 ? void 0 : _a.detailLevel) === 'executive' ? 'executive' : 'technical'
                        });
                        result.documentPackage = { [options.exportFormat + 'Path']: documentPackage };
                        result.workflowMetadata.stepsCompleted.push('Document Package');
                    }
                    catch (error) {
                        this.logger.warn('Document package generation failed', {
                            error: error.message
                        }, 'AgenticPMOrchestrator');
                        result.workflowMetadata.errors.push({ step: 'Document Package', error: error.message });
                        result.workflowMetadata.stepsSkipped.push('Document Package');
                    }
                }
                else {
                    result.workflowMetadata.stepsSkipped.push('Document Package');
                }
                // Finalize workflow
                const endTime = new Date();
                result.workflowMetadata.endTime = endTime.toISOString();
                result.workflowMetadata.duration = endTime.getTime() - startTime.getTime();
                this.logger.info('Agentic PM workflow completed successfully', {
                    productTitle: validatedConcept.title,
                    duration: result.workflowMetadata.duration,
                    stepsCompleted: result.workflowMetadata.stepsCompleted.length,
                    stepsSkipped: result.workflowMetadata.stepsSkipped.length,
                    errors: result.workflowMetadata.errors.length
                }, 'AgenticPMOrchestrator');
                return result;
            }
            catch (error) {
                const endTime = new Date();
                result.workflowMetadata.endTime = endTime.toISOString();
                result.workflowMetadata.duration = endTime.getTime() - startTime.getTime();
                result.workflowMetadata.errors.push({ step: 'Workflow', error: error.message });
                this.logger.error('Agentic PM workflow failed', error, {
                    productTitle: validatedConcept.title,
                    stepsCompleted: result.workflowMetadata.stepsCompleted,
                    duration: result.workflowMetadata.duration
                }, 'AgenticPMOrchestrator');
                if (error instanceof errorHandling_1.AgenticError) {
                    throw error;
                }
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.PROCESSING_ERROR, `Agentic PM workflow failed: ${error.message}`, 'The product analysis workflow could not be completed. Please try again.', { productTitle: validatedConcept.title, originalError: error.message }, true);
            }
        });
    }
    validateProductConcept(concept) {
        // Try extended schema first, then fall back to basic schema
        const extendedResult = (0, schemas_1.validateInput)(schemas_1.ExtendedProductConceptSchema, concept, 'Extended Product Concept');
        if (extendedResult.success) {
            return extendedResult;
        }
        return (0, schemas_1.validateInput)(schemas_1.ProductConceptSchema, concept, 'Product Concept');
    }
    getDefaultWorkflowOptions(options) {
        var _a, _b, _c, _d, _e, _f;
        return {
            includeMarketResearch: (_a = options === null || options === void 0 ? void 0 : options.includeMarketResearch) !== null && _a !== void 0 ? _a : true,
            includeCompetitiveAnalysis: (_b = options === null || options === void 0 ? void 0 : options.includeCompetitiveAnalysis) !== null && _b !== void 0 ? _b : true,
            includePrototype: (_c = options === null || options === void 0 ? void 0 : options.includePrototype) !== null && _c !== void 0 ? _c : false,
            includeEvaluation: (_d = options === null || options === void 0 ? void 0 : options.includeEvaluation) !== null && _d !== void 0 ? _d : true,
            evaluationModels: (_e = options === null || options === void 0 ? void 0 : options.evaluationModels) !== null && _e !== void 0 ? _e : this.multiModelAI.getAvailableModels().slice(0, 2),
            exportFormat: (_f = options === null || options === void 0 ? void 0 : options.exportFormat) !== null && _f !== void 0 ? _f : 'pdf'
        };
    }
    generatePRD(concept, preferences) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a senior product manager, create a comprehensive Product Requirements Document (PRD) for:

PRODUCT CONCEPT:
${JSON.stringify(concept, null, 2)}

USER PREFERENCES:
${JSON.stringify(preferences || {}, null, 2)}

Create a detailed PRD including:

1. EXECUTIVE SUMMARY
   - Product vision and value proposition
   - Key objectives and success criteria
   - Target market and user segments

2. PRODUCT OVERVIEW
   - Problem statement and market need
   - Solution approach and key differentiators
   - Product positioning and competitive advantage

3. USER REQUIREMENTS
   - Primary user personas with detailed profiles
   - User stories and acceptance criteria
   - User journey mapping and pain points

4. FUNCTIONAL REQUIREMENTS
   - Core features and capabilities
   - Feature prioritization (P0, P1, P2)
   - Integration requirements
   - Performance requirements

5. NON-FUNCTIONAL REQUIREMENTS
   - Technical architecture and scalability
   - Security and compliance requirements
   - Performance benchmarks
   - Accessibility and internationalization

6. SUCCESS METRICS
   - Key performance indicators (KPIs)
   - Success criteria and measurement methods
   - Baseline metrics and targets

7. IMPLEMENTATION ROADMAP
   - Development phases and milestones
   - Resource requirements and timeline
   - Risk assessment and mitigation
   - Dependencies and assumptions

8. GO-TO-MARKET STRATEGY
   - Launch strategy and channels
   - Marketing and positioning approach
   - Pricing strategy and business model
   - Customer acquisition plan

Format as a comprehensive JSON structure with detailed, actionable content.
`;
            const response = yield (0, errorHandling_1.withRetry)(() => __awaiter(this, void 0, void 0, function* () {
                return yield this.openai.chat.completions.create({
                    model: 'gpt-4-turbo-preview',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 4000
                });
            }));
            const content = response.choices[0].message.content;
            if (!content) {
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.GENERATION_FAILED, 'Failed to generate PRD content', 'PRD generation failed. Please try again.');
            }
            try {
                // Try to parse JSON response
                const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/) ||
                    content.match(/({[\s\S]*})/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[1]);
                }
                // If no JSON found, return structured text
                return {
                    title: concept.title,
                    content: content,
                    generatedAt: new Date().toISOString(),
                    type: 'text-based-prd'
                };
            }
            catch (error) {
                // Fallback to text-based PRD
                return {
                    title: concept.title,
                    content: content,
                    generatedAt: new Date().toISOString(),
                    type: 'text-based-prd'
                };
            }
        });
    }
    buildPrototypeRequirements(concept) {
        const extendedConcept = concept;
        return {
            productTitle: concept.title,
            productDescription: concept.description,
            targetUsers: concept.targetUsers || ['General users'],
            keyFeatures: concept.keyFeatures || concept.goals,
            platform: extendedConcept.platform || 'web',
            designStyle: extendedConcept.designStyle || 'modern'
        };
    }
    generateBusinessCase(concept, analysisResults) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const prompt = `
As a business strategist, create a comprehensive business case for:

PRODUCT: ${concept.title}
DESCRIPTION: ${concept.description}
TARGET MARKET: ${concept.targetMarket}

ANALYSIS RESULTS:
${JSON.stringify({
                marketResearch: analysisResults.marketResearchReport ? 'Available' : 'Not available',
                competitiveAnalysis: analysisResults.competitiveLandscapeAnalysis ? 'Available' : 'Not available',
                prdSummary: ((_a = analysisResults.productRequirementsDocument) === null || _a === void 0 ? void 0 : _a.title) || 'Generated'
            }, null, 2)}

Create a business case including:
1. Market opportunity and sizing
2. Financial projections (3-year)
3. Investment requirements and ROI
4. Risk analysis and mitigation
5. Strategic rationale and timing
6. Resource requirements
7. Success metrics and KPIs

Format as detailed JSON structure.
`;
            const response = yield (0, errorHandling_1.withRetry)(() => __awaiter(this, void 0, void 0, function* () {
                return yield this.openai.chat.completions.create({
                    model: 'gpt-4-turbo-preview',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 3000
                });
            }));
            const content = response.choices[0].message.content;
            if (!content) {
                return { error: 'Failed to generate business case' };
            }
            try {
                const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/) ||
                    content.match(/({[\s\S]*})/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[1]);
                }
                return { content, type: 'text-based' };
            }
            catch (error) {
                return { content, type: 'text-based' };
            }
        });
    }
    generateExecutiveSummary(concept, analysisResults) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a senior executive consultant, create a compelling 2-page executive summary for:

PRODUCT: ${concept.title}
DESCRIPTION: ${concept.description}

ANALYSIS COMPONENTS:
- PRD: ${analysisResults.productRequirementsDocument ? 'Generated' : 'Not available'}
- Market Research: ${analysisResults.marketResearchReport ? 'Completed' : 'Not available'}
- Competitive Analysis: ${analysisResults.competitiveLandscapeAnalysis ? 'Completed' : 'Not available'}
- Business Case: ${analysisResults.businessCase ? 'Generated' : 'Not available'}

Create an executive summary that includes:
1. Product vision and market opportunity (3-4 sentences)
2. Strategic rationale and competitive advantage (1 paragraph)
3. Business impact and financial projections (bullet points)
4. Implementation approach and timeline (1 paragraph)
5. Key success metrics and validation (3-5 metrics)
6. Recommendation and next steps (2-3 sentences)

Write for C-level executives who need to make investment decisions quickly.
Use data-driven insights and avoid jargon. Be compelling but realistic.
`;
            const response = yield (0, errorHandling_1.withRetry)(() => __awaiter(this, void 0, void 0, function* () {
                return yield this.openai.chat.completions.create({
                    model: 'gpt-4-turbo-preview',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 2000
                });
            }));
            return response.choices[0].message.content || 'Executive summary generation failed.';
        });
    }
    // Utility method to get available evaluation models
    getAvailableEvaluationModels() {
        return this.multiModelAI.getAvailableModels();
    }
    // Test method to verify all integrations
    testIntegrations() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const results = {};
            try {
                // Test OpenAI connection
                const testResponse = yield this.openai.chat.completions.create({
                    model: 'gpt-4-turbo-preview',
                    messages: [{ role: 'user', content: 'Respond with: Connection test successful' }],
                    max_tokens: 50
                });
                results.openai = ((_a = testResponse.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.includes('successful')) || false;
            }
            catch (error) {
                results.openai = false;
            }
            // Test multi-model AI
            try {
                const modelTests = yield this.multiModelAI.testConnectivity();
                results.multiModelAI = Object.values(modelTests).some(success => success);
                Object.assign(results, modelTests);
            }
            catch (error) {
                results.multiModelAI = false;
            }
            return results;
        });
    }
}
exports.AgenticPMOrchestrator = AgenticPMOrchestrator;
