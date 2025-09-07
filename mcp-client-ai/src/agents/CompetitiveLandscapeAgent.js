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
exports.CompetitiveLandscapeAgent = void 0;
const schemas_1 = require("../validation/schemas");
const errorHandling_1 = require("../utils/errorHandling");
class CompetitiveLandscapeAgent {
    constructor(openai) {
        this.openai = openai;
        this.logger = errorHandling_1.Logger.getInstance();
    }
    analyzeCompetitiveLandscape(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestId = `cl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.logger.setContext(requestId);
            this.logger.info('Starting competitive landscape analysis', {
                productTitle: input === null || input === void 0 ? void 0 : input.productTitle
            }, 'CompetitiveLandscapeAgent');
            // Validate input
            const validationResult = (0, schemas_1.validateInput)(schemas_1.CompetitiveLandscapeInputSchema, input, 'Competitive Landscape Input');
            if (!validationResult.success) {
                this.logger.error('Input validation failed', validationResult.error, {
                    input: input
                }, 'CompetitiveLandscapeAgent');
                throw (0, errorHandling_1.handleZodError)(validationResult.error.details, 'Competitive Landscape Input');
            }
            const validatedInput = validationResult.data;
            // Execute competitive analysis in parallel
            const [marketOverview, directCompetitors, indirectCompetitors, emergingThreats, marketGaps, positioning] = yield Promise.all([
                this.analyzeMarketOverview(productTitle, productDescription, targetMarket),
                this.identifyDirectCompetitors(productTitle, productDescription, targetMarket),
                this.identifyIndirectCompetitors(productTitle, productDescription, targetMarket),
                this.identifyEmergingThreats(productTitle, productDescription, targetMarket),
                this.identifyMarketGaps(productTitle, productDescription, targetMarket),
                this.analyzePositioning(productTitle, productDescription, targetMarket)
            ]);
            // Synthesize comprehensive competitive landscape report
            const report = yield this.synthesizeLandscapeReport({
                productTitle,
                productDescription,
                targetMarket,
                marketOverview,
                directCompetitors,
                indirectCompetitors,
                emergingThreats,
                marketGaps,
                positioning
            });
            return report;
        });
    }
    analyzeMarketOverview(productTitle, productDescription, targetMarket) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a market analyst, provide a comprehensive overview of the competitive market for:

Product: ${productTitle}
Description: ${productDescription}
Target Market: ${targetMarket}

Analyze:
1. Total market size and growth trajectory
2. Market maturity and lifecycle stage
3. Level of market fragmentation vs consolidation
4. Key market trends shaping competition
5. Barriers to entry and exit
6. Industry profitability drivers
7. Value chain analysis

Provide specific data points and insights, not generic statements.

Format as JSON with quantitative metrics where possible.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
    identifyDirectCompetitors(productTitle, productDescription, targetMarket) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a competitive intelligence analyst, identify and analyze the top 7 direct competitors for:

Product: ${productTitle}
Description: ${productDescription}
Target Market: ${targetMarket}

For each direct competitor, provide comprehensive analysis including:
- Company overview (name, founded, HQ, employees, funding)
- Product details (core offering, key features, pricing model)
- Market position (market share, customer base, geographic presence)
- SWOT analysis (strengths, weaknesses, opportunities, threats)
- Strategic focus and recent developments
- Financial performance indicators
- Customer satisfaction and brand perception

Focus on companies that solve the same problem for the same customer segment.

Format as JSON array of detailed competitor profiles.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 3500
            });
            const result = this.parseJsonResponse(response.choices[0].message.content || '[]');
            return Array.isArray(result) ? result : [];
        });
    }
    identifyIndirectCompetitors(productTitle, productDescription, targetMarket) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a strategic analyst, identify the top 5 indirect competitors for:

Product: ${productTitle}
Description: ${productDescription}
Target Market: ${targetMarket}

Focus on companies that:
- Solve the same customer problem with different approaches
- Target the same customer budget/time with alternative solutions
- Could easily pivot into direct competition
- Represent substitute solutions or workarounds

For each indirect competitor, analyze:
- How they currently address the customer need
- Why customers might choose them instead
- Their potential to become direct competitors
- Strategic vulnerabilities we could exploit
- Partnership opportunities

Format as JSON array of competitor profiles.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 2500
            });
            const result = this.parseJsonResponse(response.choices[0].message.content || '[]');
            return Array.isArray(result) ? result : [];
        });
    }
    identifyEmergingThreats(productTitle, productDescription, targetMarket) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a threat intelligence analyst, identify emerging competitive threats for:

Product: ${productTitle}  
Description: ${productDescription}
Target Market: ${targetMarket}

Look for:
- Well-funded startups in adjacent spaces
- Big tech companies with relevant capabilities
- International players expanding globally
- New business models disrupting the space
- Technology shifts enabling new entrants

For each emerging threat, analyze:
- Current capabilities and resources
- Likelihood of market entry
- Potential competitive advantages
- Timeline for market impact
- Strategic response requirements

Format as JSON array focusing on future competitive threats.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 2000
            });
            const result = this.parseJsonResponse(response.choices[0].message.content || '[]');
            return Array.isArray(result) ? result : [];
        });
    }
    identifyMarketGaps(productTitle, productDescription, targetMarket) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a market opportunity analyst, identify specific market gaps and white space opportunities for:

Product: ${productTitle}
Description: ${productDescription}
Target Market: ${targetMarket}

Identify gaps in:
1. Feature gaps - functionality competitors don't provide
2. Segment gaps - underserved customer segments  
3. Price gaps - unaddressed price points
4. Geographic gaps - underserved markets
5. Channel gaps - distribution opportunities
6. Integration gaps - ecosystem connections missing

For each gap, assess:
- Size of the opportunity
- Difficulty to address
- Time to market
- Competitive response likelihood
- Revenue potential
- Strategic value

Format as JSON array of market gap opportunities.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 2000
            });
            const result = this.parseJsonResponse(response.choices[0].message.content || '[]');
            return Array.isArray(result) ? result : [];
        });
    }
    analyzePositioning(productTitle, productDescription, targetMarket) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a positioning strategist, develop competitive positioning recommendations for:

Product: ${productTitle}
Description: ${productDescription}
Target Market: ${targetMarket}

Create positioning strategy including:
1. Market category definition and subcategory
2. Unique positioning statement
3. Key differentiation factors vs competitors
4. Sustainable competitive advantages
5. Positioning vulnerabilities to address
6. Message hierarchy and proof points
7. Competitive response strategies

Base recommendations on realistic competitive analysis, not wishful thinking.

Format as JSON positioning strategy.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 1500
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
    synthesizeLandscapeReport(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
As a senior strategy consultant, synthesize the following competitive intelligence into a comprehensive competitive landscape report:

Product: ${data.productTitle}
Description: ${data.productDescription}
Target Market: ${data.targetMarket}

Market Overview: ${JSON.stringify(data.marketOverview)}
Direct Competitors: ${JSON.stringify(data.directCompetitors)}
Indirect Competitors: ${JSON.stringify(data.indirectCompetitors)}
Emerging Threats: ${JSON.stringify(data.emergingThreats)}
Market Gaps: ${JSON.stringify(data.marketGaps)}
Positioning Analysis: ${JSON.stringify(data.positioning)}

Create a synthesized strategic report with:
1. Executive summary highlighting key insights
2. Integrated competitive analysis
3. Strategic recommendations prioritized by impact
4. Competitive monitoring framework
5. Risk assessment with mitigation strategies
6. Action plan with timelines

Ensure recommendations are specific, actionable, and prioritized.

Format as comprehensive JSON matching CompetitiveLandscapeReport interface.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 4000
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
    parseJsonResponse(content) {
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/) ||
                content.match(/```\s*({[\s\S]*?})\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1] : content;
            return JSON.parse(jsonString);
        }
        catch (error) {
            console.error('[CompetitiveLandscapeAgent] Failed to parse JSON response:', error);
            console.error('[DEBUG] Raw content:', content.substring(0, 500) + '...');
            return {
                error: 'Failed to parse competitive landscape data',
                rawContent: content.substring(0, 1000)
            };
        }
    }
    // Utility method for competitive benchmarking
    benchmarkAgainstCompetitor(ourProduct, competitorName, benchmarkAreas) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
Conduct a detailed competitive benchmark between:

Our Product: ${ourProduct}
Competitor: ${competitorName}
Benchmark Areas: ${benchmarkAreas.join(', ')}

For each area, provide:
- Current state comparison
- Competitive gap analysis  
- Recommendations to close gaps
- Timeline and resource requirements
- Success metrics

Format as detailed JSON benchmark report.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
    // Utility method for competitive war gaming
    simulateCompetitiveResponse(ourStrategy, keyCompetitors, marketScenario) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = `
Simulate competitive responses to our strategy:

Our Strategy: ${ourStrategy}
Key Competitors: ${keyCompetitors.join(', ')}
Market Scenario: ${marketScenario}

For each competitor, predict:
- Most likely response strategy
- Timeline for response
- Resource requirements for their response
- Effectiveness of their response
- Counter-strategies we should prepare

Format as competitive war game simulation results in JSON.
`;
            const response = yield this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5
            });
            return this.parseJsonResponse(response.choices[0].message.content || '{}');
        });
    }
}
exports.CompetitiveLandscapeAgent = CompetitiveLandscapeAgent;
