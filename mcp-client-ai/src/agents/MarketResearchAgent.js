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
exports.MarketResearchAgent = void 0;
const schemas_1 = require("../validation/schemas");
const errorHandling_1 = require("../utils/errorHandling");
class MarketResearchAgent {
    constructor(openai) {
        this.webSearchEnabled = false; // Toggle for web search capability
        this.openai = openai;
        this.logger = errorHandling_1.Logger.getInstance();
    }
    conductMarketResearch(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestId = `mr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.logger.setContext(requestId);
            this.logger.info('Starting market research analysis', {
                productTitle: input === null || input === void 0 ? void 0 : input.productTitle
            }, 'MarketResearchAgent');
            // Validate input
            const validationResult = (0, schemas_1.validateInput)(schemas_1.MarketResearchInputSchema, input, 'Market Research Input');
            if (!validationResult.success) {
                this.logger.error('Input validation failed', validationResult.error, {
                    input: input
                }, 'MarketResearchAgent');
                throw (0, errorHandling_1.handleZodError)(validationResult.error.details, 'Market Research Input');
            }
            const validatedInput = validationResult.data;
            try {
                // Parallel research execution for efficiency with error handling
                const [marketSizing, competitiveIntel, customerInsights, trendAnalysis, riskAssessment] = yield Promise.all([
                    this.analyzeMarketSizing(validatedInput),
                    this.analyzeCompetitiveLandscape(validatedInput),
                    this.analyzeCustomerSegments(validatedInput),
                    this.analyzeTrends(validatedInput),
                    this.assessRisks(validatedInput)
                ]);
                // Synthesize findings into comprehensive report
                const report = yield this.synthesizeReport(validatedInput, {
                    marketSizing,
                    competitiveIntel,
                    customerInsights,
                    trendAnalysis,
                    riskAssessment
                });
                this.logger.info('Market research completed successfully', {
                    productTitle: validatedInput.productTitle,
                    reportSections: Object.keys(report)
                }, 'MarketResearchAgent');
                return report;
            }
            catch (error) {
                this.logger.error('Market research analysis failed', error, {
                    productTitle: validatedInput.productTitle,
                    step: 'parallel_analysis'
                }, 'MarketResearchAgent');
                if (error instanceof errorHandling_1.AgenticError) {
                    throw error;
                }
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.MARKET_RESEARCH_ERROR, `Market research failed: ${error.message}`, 'Market research analysis could not be completed. Please try again.', { productTitle: validatedInput.productTitle, originalError: error.message }, true);
            }
        });
    }
    analyzeMarketSizing(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, errorHandling_1.withRetry)(() => __awaiter(this, void 0, void 0, function* () {
                this.logger.debug('Starting market sizing analysis', {
                    productTitle: input.productTitle
                }, 'MarketResearchAgent');
                const prompt = `
As a market research analyst, provide a comprehensive market sizing analysis for the following product:

Product: ${input.productTitle}
Description: ${input.productDescription}
Target Market: ${input.targetMarket}
Geography: ${input.geography || 'Global'}

Provide realistic market sizing estimates with clear methodology. Include:
1. TAM (Total Addressable Market) in USD
2. SAM (Serviceable Addressable Market) in USD  
3. SOM (Serviceable Obtainable Market) for first 3 years in USD
4. Market growth rate (CAGR)
5. Market maturity stage
6. Key growth drivers
7. Market entry barriers

Format as JSON with numerical values and clear reasoning.
`;
                try {
                    const response = yield this.openai.chat.completions.create({
                        model: 'gpt-4',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.3,
                        timeout: 30000 // 30 second timeout
                    });
                    const content = response.choices[0].message.content;
                    if (!content) {
                        throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.GENERATION_FAILED, 'OpenAI returned empty response for market sizing', 'Market sizing analysis failed to generate content.', { productTitle: input.productTitle }, true);
                    }
                    const result = this.parseJsonResponse(content);
                    // Validate the result structure
                    const validationResult = (0, schemas_1.validateInput)(schemas_1.MarketOpportunitySchema, result, 'Market Sizing Response');
                    if (!validationResult.success) {
                        this.logger.warn('Market sizing response validation failed, using fallback', {
                            error: validationResult.error,
                            rawResponse: content === null || content === void 0 ? void 0 : content.substring(0, 500)
                        }, 'MarketResearchAgent');
                        return this.getMarketSizingFallback(input);
                    }
                    this.logger.debug('Market sizing analysis completed', {
                        tam: validationResult.data.tam,
                        sam: validationResult.data.sam
                    }, 'MarketResearchAgent');
                    return validationResult.data;
                }
                catch (error) {
                    if (error instanceof errorHandling_1.AgenticError) {
                        throw error;
                    }
                    throw (0, errorHandling_1.handleOpenAIError)(error, 'Market Sizing Analysis');
                }
            }), {
                maxAttempts: 3,
                baseDelay: 2000,
                retryCondition: (error) => {
                    return error instanceof errorHandling_1.AgenticError && error.retryable;
                }
            });
        });
    }
    analyzeCompetitiveLandscape(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a competitive intelligence analyst, analyze the competitive landscape for:

Product: ${input.productTitle}
Description: ${input.productDescription}
Target Market: ${input.targetMarket}

Identify and analyze:
1. 5 direct competitors with detailed profiles
2. 3 indirect competitors
3. Competitive positioning opportunities
4. Differentiation strategies
5. Pricing benchmarks
6. Market gaps and white space opportunities

For each competitor include: name, description, market share estimate, key strengths, weaknesses, pricing model, and funding stage.

Format as comprehensive JSON structure.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
    analyzeCustomerSegments(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a customer research specialist, create detailed customer analysis for:

Product: ${input.productTitle}
Description: ${input.productDescription}
Target Market: ${input.targetMarket}

Develop:
1. 3 primary customer personas with demographics, psychographics, pain points
2. Market segmentation strategy
3. Customer journey mapping
4. Willingness to pay analysis
5. Preferred acquisition channels
6. Decision-making criteria

Make personas realistic with specific details, not generic archetypes.

Format as detailed JSON structure.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
    analyzeTrends(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a market trend analyst, identify key trends affecting:

Product: ${input.productTitle}
Description: ${input.productDescription}
Target Market: ${input.targetMarket}

Analyze:
1. Emerging trends that create opportunities
2. Threatening trends that pose risks
3. Technology trends impacting the market
4. Consumer behavior shifts
5. Regulatory/policy changes
6. Economic factors

Provide specific, actionable insights with timing estimates.

Format as JSON structure with trend categories.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
    assessRisks(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a risk analyst, assess risks and mitigation strategies for:

Product: ${input.productTitle}
Description: ${input.productDescription}
Target Market: ${input.targetMarket}

Identify and analyze:
1. Market risks (demand, timing, saturation)
2. Competitive risks (new entrants, price wars)
3. Technology risks (obsolescence, platform changes)
4. Regulatory risks (compliance, policy changes)
5. Execution risks (team, resources, partnerships)

For each risk, provide:
- Probability (High/Medium/Low)
- Impact (High/Medium/Low)  
- Specific mitigation strategies
- Early warning indicators

Format as comprehensive JSON risk register.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
    synthesizeReport(input, analyses) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a senior market research director, synthesize the following analyses into a comprehensive market research report:

Product: ${input.productTitle}
Description: ${input.productDescription}

Market Sizing Analysis: ${JSON.stringify(analyses.marketSizing)}
Competitive Analysis: ${JSON.stringify(analyses.competitiveIntel)}
Customer Analysis: ${JSON.stringify(analyses.customerInsights)}
Trend Analysis: ${JSON.stringify(analyses.trendAnalysis)}
Risk Analysis: ${JSON.stringify(analyses.riskAssessment)}

Create a synthesized report with:
1. Executive summary (2-3 paragraphs)
2. Integrated market opportunity assessment
3. Competitive positioning recommendations
4. Customer acquisition strategy
5. Go-to-market recommendations
6. Key success metrics to track
7. Strategic recommendations

Ensure insights are actionable and prioritized by impact/effort.

Format as comprehensive JSON structure matching the MarketResearchReport interface.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 4000
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
    parseJsonResponse(content) {
        try {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/) ||
                content.match(/```\s*({[\s\S]*?})\s*```/) ||
                content.match(/({[\s\S]*})/);
            const jsonString = jsonMatch ? jsonMatch[1] : content;
            return JSON.parse(jsonString);
        }
        catch (error) {
            this.logger.error('Failed to parse JSON response', error, {
                contentLength: content.length,
                contentPreview: content.substring(0, 200)
            }, 'MarketResearchAgent');
            throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.PROCESSING_ERROR, `Failed to parse AI response: ${error.message}`, 'The AI response could not be processed. Please try again.', { rawContent: content.substring(0, 500) }, true);
        }
    }
    getMarketSizingFallback(input) {
        this.logger.info('Using market sizing fallback', {
            productTitle: input.productTitle
        }, 'MarketResearchAgent');
        // Provide a reasonable fallback based on common market patterns
        const baseTAM = 1000000000; // $1B baseline
        const tamMultiplier = input.targetMarket.toLowerCase().includes('global') ? 10 : 1;
        return {
            tam: baseTAM * tamMultiplier,
            sam: baseTAM * tamMultiplier * 0.1, // 10% of TAM
            som: baseTAM * tamMultiplier * 0.01, // 1% of TAM
            growthRate: 15, // 15% CAGR default
            marketMaturity: 'growing',
            keyDrivers: [
                'Digital transformation trends',
                'Increasing market demand',
                'Technology adoption'
            ],
            barriers: [
                'Market competition',
                'Regulatory requirements',
                'Capital requirements'
            ]
        };
    }
    // Future enhancement: Web search integration
    searchWebForMarketData(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.webSearchEnabled) {
                return { error: 'Web search not enabled' };
            }
            // Implementation would use search APIs like:
            // - Google Custom Search API
            // - Bing Search API  
            // - Serper API
            // - SerpAPI
            return { placeholder: 'Web search results would go here' };
        });
    }
    // Future enhancement: Industry database integration
    queryIndustryDatabases(industry) {
        return __awaiter(this, void 0, void 0, function* () {
            // Integration with databases like:
            // - IBISWorld
            // - Euromonitor
            // - Statista
            // - PitchBook
            // - Crunchbase
            return { placeholder: 'Industry database results would go here' };
        });
    }
}
exports.MarketResearchAgent = MarketResearchAgent;
