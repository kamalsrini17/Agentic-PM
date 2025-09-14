/**
 * Pricing Agent - Generates pricing recommendations based on PRD analysis
 * Uses Kyle Poyar/OpenView methodologies for data-driven pricing strategies
 */

import { Logger, AgenticError, ErrorCode, withRetry } from '../utils/errorHandling';
import { MultiModelAI } from '../services/MultiModelAI';
import { ProductConcept } from '../validation/schemas';

// ============================================================================
// PRICING AGENT INTERFACES
// ============================================================================

export interface PricingAnalysisRequest {
  prdDocument: any; // Complete PRD
  productConcept: ProductConcept;
  analysisContext?: string;
}

export interface PricingRecommendation {
  featureName: string;
  generatedDate: string;
  valueMetric: {
    proposedModel: string;
    rationale: string;
    primaryMeter: string;
    secondaryMeter: string;
  };
  packaging: {
    recommendedTier: string;
    expansionPath: string;
    benchmarkInsight: string;
  };
  pricingPage: {
    snippet: string;
    bestPractices: string[];
  };
  experiments: Array<{
    description: string;
    successMetric: string;
  }>;
  annualIncentives: {
    recommendedPerks: string[];
    maxDiscountPercent: number;
    benchmarkInsight: string;
  };
  priceChangePlaybook: {
    rationale: string;
    gracePeriod: string;
    grandfatheringPolicy: string;
    churnRiskMitigation: string;
  };
  openQuestions: string[];
  formattedRecommendation: string; // The final formatted output
}

// ============================================================================
// PRICING AGENT
// ============================================================================

export class PricingAgent {
  private multiModelAI: MultiModelAI | null;
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
    
    try {
      this.multiModelAI = new MultiModelAI();
    } catch (error) {
      this.logger.warn('MultiModelAI initialization failed, running in fallback mode', {
        error: (error as Error).message
      }, 'PricingAgent');
      this.multiModelAI = null;
    }
  }

  // ============================================================================
  // MAIN PRICING ANALYSIS METHOD
  // ============================================================================

  async generatePricingRecommendations(request: PricingAnalysisRequest): Promise<PricingRecommendation> {
    const requestId = `pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.logger.setContext(requestId);

    this.logger.info('Starting pricing analysis', {
      productTitle: request.productConcept.title,
      hasPRD: !!request.prdDocument
    }, 'PricingAgent');

    try {
      let recommendations: Omit<PricingRecommendation, 'formattedRecommendation'>;

      if (this.multiModelAI) {
        // Step 1: Analyze PRD for pricing-relevant features
        const pricingContext = await this.analyzePRDForPricing(request);

        // Step 2: Generate comprehensive pricing recommendations
        recommendations = await this.generateComprehensivePricingAnalysis(pricingContext, request);
      } else {
        // Fallback mode without API calls
        this.logger.info('Using fallback pricing recommendations (no API available)', {
          productTitle: request.productConcept.title
        }, 'PricingAgent');
        
        recommendations = this.generateFallbackRecommendations(request.productConcept);
      }

      // Step 3: Format using the provided template
      const formattedRecommendation = this.formatPricingRecommendation(recommendations);

      const finalRecommendation: PricingRecommendation = {
        ...recommendations,
        formattedRecommendation
      };

      this.logger.info('Pricing analysis completed successfully', {
        productTitle: request.productConcept.title,
        proposedModel: recommendations.valueMetric.proposedModel,
        recommendedTier: recommendations.packaging.recommendedTier
      }, 'PricingAgent');

      return finalRecommendation;

    } catch (error) {
      this.logger.error('Pricing analysis failed', error as Error, {
        productTitle: request.productConcept.title
      }, 'PricingAgent');

      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        `Pricing analysis failed: ${(error as Error).message}`,
        'Unable to generate pricing recommendations. Please try again.',
        { productTitle: request.productConcept.title },
        true
      );
    }
  }

  // ============================================================================
  // PRD ANALYSIS FOR PRICING
  // ============================================================================

  private async analyzePRDForPricing(request: PricingAnalysisRequest): Promise<any> {
    if (!this.multiModelAI) {
      throw new Error('MultiModelAI not available for PRD analysis');
    }

    const analysisPrompt = `
As a pricing strategy expert familiar with Kyle Poyar and OpenView research, analyze this PRD for pricing opportunities:

PRODUCT CONCEPT:
${JSON.stringify(request.productConcept, null, 2)}

PRD DOCUMENT:
${JSON.stringify(request.prdDocument, null, 2)}

Analyze and extract:

1. VALUE DRIVERS: What specific features/capabilities drive customer value?
2. USAGE PATTERNS: How do customers likely use this product (seats, transactions, data, API calls)?
3. MARKET POSITIONING: Is this a basic, professional, or enterprise-grade solution?
4. COMPETITIVE LANDSCAPE: What pricing models exist in this space?
5. SCALABILITY FACTORS: What metrics scale with customer success/growth?

Provide a structured analysis focusing on pricing-relevant insights.
`;

    const response = await withRetry(async () => {
      return await this.multiModelAI!.queryMultipleModels({
        prompt: analysisPrompt,
        models: ['gpt-4'],
        temperature: 0.3,
        maxTokens: 2000
      });
    });

    const analysis = response.responses['gpt-4']?.content;
    if (!analysis) {
      throw new Error('Failed to analyze PRD for pricing context');
    }

    return {
      analysis,
      productConcept: request.productConcept,
      prdDocument: request.prdDocument
    };
  }

  // ============================================================================
  // COMPREHENSIVE PRICING ANALYSIS
  // ============================================================================

  private async generateComprehensivePricingAnalysis(
    pricingContext: any, 
    request: PricingAnalysisRequest
  ): Promise<Omit<PricingRecommendation, 'formattedRecommendation'>> {
    
    if (!this.multiModelAI) {
      throw new Error('MultiModelAI not available for comprehensive analysis');
    }

    const pricingPrompt = `
As a SaaS pricing expert using Kyle Poyar and OpenView methodologies, generate comprehensive pricing recommendations:

PRICING CONTEXT:
${pricingContext.analysis}

PRODUCT: ${request.productConcept.title}
DESCRIPTION: ${request.productConcept.description}
TARGET MARKET: ${request.productConcept.targetMarket}
KEY FEATURES: ${request.productConcept.keyFeatures?.join(', ')}

Generate detailed recommendations covering:

1. VALUE METRIC ANALYSIS
   - Optimal pricing model (subscription, usage-based, hybrid)
   - Primary and secondary meters
   - Rationale based on customer value alignment

2. PACKAGING STRATEGY  
   - Recommended tier placement (Starter/Growth/Professional/Enterprise)
   - Expansion opportunities
   - Benchmark insights from similar SaaS products

3. PRICING PAGE STRATEGY
   - Customer-facing pricing snippet
   - Best practices applied

4. EXPERIMENT DESIGN
   - 2 specific A/B test hypotheses
   - Success metrics for each test

5. ANNUAL PLAN STRATEGY
   - Recommended perks over discounts
   - Maximum discount if needed
   - Retention-focused incentives

6. PRICE CHANGE PLAYBOOK
   - Communication strategy
   - Grace periods and grandfathering
   - Churn risk mitigation

7. STRATEGIC QUESTIONS
   - 3 key open questions for further research

Base recommendations on Kyle Poyar research: ~60% of SaaS companies use usage-based pricing, perks outperform discounts, pricing changes should be systematic programs.

Format as structured JSON with specific, actionable recommendations.
`;

    const response = await withRetry(async () => {
      return await this.multiModelAI!.queryMultipleModels({
        prompt: pricingPrompt,
        models: ['gpt-4'],
        temperature: 0.3,
        maxTokens: 3000
      });
    });

    const content = response.responses['gpt-4']?.content;
    if (!content) {
      throw new Error('Failed to generate pricing recommendations');
    }

    // Try to parse JSON response, fallback to structured parsing
    try {
      const jsonMatch = content.match(/```json\s*({[\s\S]*?})\s*```/) || 
                       content.match(/({[\s\S]*})/);
      
      let parsedData;
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback: extract structured data from text
        parsedData = this.parseTextualRecommendations(content, request.productConcept);
      }

      return {
        featureName: request.productConcept.title,
        generatedDate: new Date().toISOString().split('T')[0],
        valueMetric: {
          proposedModel: parsedData.valueMetric?.proposedModel || 'Hybrid (Seats + Usage)',
          rationale: parsedData.valueMetric?.rationale || 'Usage-based pricing aligns revenue with customer value delivered',
          primaryMeter: parsedData.valueMetric?.primaryMeter || 'Seats',
          secondaryMeter: parsedData.valueMetric?.secondaryMeter || 'API calls / transactions'
        },
        packaging: {
          recommendedTier: parsedData.packaging?.recommendedTier || 'Professional Plan',
          expansionPath: parsedData.packaging?.expansionPath || 'Add-on packs for heavy usage',
          benchmarkInsight: parsedData.packaging?.benchmarkInsight || 'Best-in-class SaaS companies use tiered packaging with transparent usage meters'
        },
        pricingPage: {
          snippet: parsedData.pricingPage?.snippet || this.generateDefaultPricingSnippet(request.productConcept),
          bestPractices: parsedData.pricingPage?.bestPractices || [
            'Clear tier names',
            'Transparent usage meter thresholds', 
            'Enterprise contact sales path',
            'FAQ section'
          ]
        },
        experiments: parsedData.experiments || [
          {
            description: 'Test usage pack sizes (1k vs. 5k vs. 10k units)',
            successMetric: 'Expansion revenue ↑ without >5% increase in churn'
          },
          {
            description: 'Annual plan perk comparison (discount vs. feature access)',
            successMetric: 'Equal or improved annual adoption with better LTV'
          }
        ],
        annualIncentives: {
          recommendedPerks: parsedData.annualIncentives?.recommendedPerks || [
            'Usage credit rollover',
            'Priority support',
            'Early access to new features'
          ],
          maxDiscountPercent: parsedData.annualIncentives?.maxDiscountPercent || 15,
          benchmarkInsight: parsedData.annualIncentives?.benchmarkInsight || 'Perks often outperform discounts in boosting conversion and retention'
        },
        priceChangePlaybook: {
          rationale: parsedData.priceChangePlaybook?.rationale || 'New features deliver measurable ROI to customers',
          gracePeriod: parsedData.priceChangePlaybook?.gracePeriod || '6 months for existing customers',
          grandfatheringPolicy: parsedData.priceChangePlaybook?.grandfatheringPolicy || 'Legacy pricing for accounts under $X threshold',
          churnRiskMitigation: parsedData.priceChangePlaybook?.churnRiskMitigation || 'Segment-based churn prediction with save-offer bundles'
        },
        openQuestions: parsedData.openQuestions || [
          'What is the customer willingness-to-pay (WTP) range for this solution?',
          'Do marginal costs justify current usage-based pricing structure?',
          'Should advanced features default to bundled or add-on model?'
        ]
      };

    } catch (error) {
      this.logger.warn('Failed to parse JSON recommendations, using fallback', {
        error: (error as Error).message
      }, 'PricingAgent');
      
      return this.generateFallbackRecommendations(request.productConcept);
    }
  }

  // ============================================================================
  // TEMPLATE FORMATTING
  // ============================================================================

  private formatPricingRecommendation(recommendations: Omit<PricingRecommendation, 'formattedRecommendation'>): string {
    return `Pricing Recommendation (Generated by Pricing Agent)

Feature / Product: ${recommendations.featureName}
Date: ${recommendations.generatedDate}
Source Research: OpenView (Kyle Poyar)

1. 📊 Value Metric Recommendation

Proposed Model: ${recommendations.valueMetric.proposedModel}

Rationale: ${recommendations.valueMetric.rationale}

Meter Candidates:

Primary: ${recommendations.valueMetric.primaryMeter}

Secondary: ${recommendations.valueMetric.secondaryMeter}

2. 📦 Packaging Guidance

Placement: ${recommendations.packaging.recommendedTier}

Expansion Opportunity: ${recommendations.packaging.expansionPath}

Benchmark Insight: ${recommendations.packaging.benchmarkInsight}

3. 💻 Pricing Page Recommendation

Snippet (auto-generated):

${recommendations.pricingPage.snippet}

Best Practices Applied: ${recommendations.pricingPage.bestPractices.join(', ')}.

4. 🧪 Experiment Hypotheses

Test 1: ${recommendations.experiments[0]?.description || 'Usage tier optimization'}

Success Metric: ${recommendations.experiments[0]?.successMetric || 'Revenue expansion without churn increase'}

Test 2: ${recommendations.experiments[1]?.description || 'Annual plan incentive comparison'}

Success Metric: ${recommendations.experiments[1]?.successMetric || 'Improved annual adoption and LTV'}

Insight: Treat pricing tests like feature experiments with hypotheses + cohorts.

5. 🔄 Annual Plan Incentives

Recommendation: ${recommendations.annualIncentives.recommendedPerks.join(', ')}

Fallback: If discounting, cap at ${recommendations.annualIncentives.maxDiscountPercent}%

Benchmark Insight: ${recommendations.annualIncentives.benchmarkInsight}

6. 📈 Price Change Playbook (if introducing new charges)

Comms Plan:

Rationale: ${recommendations.priceChangePlaybook.rationale}

Grace period: ${recommendations.priceChangePlaybook.gracePeriod}

Grandfathering: ${recommendations.priceChangePlaybook.grandfatheringPolicy}

Risk Management: ${recommendations.priceChangePlaybook.churnRiskMitigation}

Benchmark Insight: Normalize price changes as a repeatable program.

7. ✅ Open Questions

${recommendations.openQuestions.map(q => `• ${q}`).join('\n')}`;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private parseTextualRecommendations(content: string, productConcept: ProductConcept): any {
    // Fallback parser for when JSON parsing fails
    return {
      valueMetric: {
        proposedModel: this.extractBetween(content, 'pricing model', ['hybrid', 'usage', 'subscription']) || 'Hybrid (Seats + Usage)',
        rationale: 'Usage-based pricing aligns revenue with customer value delivered and reduces upfront friction',
        primaryMeter: 'Seats (baseline adoption)',
        secondaryMeter: 'API calls / transactions (scales with value)'
      },
      packaging: {
        recommendedTier: this.extractBetween(content, 'tier', ['professional', 'growth', 'enterprise']) || 'Professional Plan',
        expansionPath: 'Add-on packs for heavy users with transparent overage visibility',
        benchmarkInsight: 'Best-in-class SaaS companies use tiered packaging with transparent usage meters'
      }
    };
  }

  private extractBetween(text: string, keyword: string, options: string[]): string | null {
    const lowerText = text.toLowerCase();
    const keywordIndex = lowerText.indexOf(keyword.toLowerCase());
    
    if (keywordIndex === -1) return null;
    
    const searchText = lowerText.slice(keywordIndex, keywordIndex + 200);
    
    for (const option of options) {
      if (searchText.includes(option.toLowerCase())) {
        return option.charAt(0).toUpperCase() + option.slice(1);
      }
    }
    
    return null;
  }

  private generateDefaultPricingSnippet(productConcept: ProductConcept): string {
    const productName = productConcept.title;
    return `Professional Plan includes 1,000 ${this.inferUsageUnit(productConcept)}/month.
Additional ${this.inferUsageUnit(productConcept)}: $0.05 per unit.
Toggle between monthly and annual billing for savings.
Contact Sales for Enterprise scale.`;
  }

  private inferUsageUnit(productConcept: ProductConcept): string {
    const description = productConcept.description?.toLowerCase() || '';
    const features = productConcept.keyFeatures?.join(' ').toLowerCase() || '';
    const combined = `${description} ${features}`;

    if (combined.includes('api') || combined.includes('call')) return 'API calls';
    if (combined.includes('message') || combined.includes('notification')) return 'messages';
    if (combined.includes('transaction') || combined.includes('process')) return 'transactions';
    if (combined.includes('user') || combined.includes('seat')) return 'seats';
    if (combined.includes('storage') || combined.includes('data')) return 'GB';
    
    return 'credits';
  }

  private generateFallbackRecommendations(productConcept: ProductConcept): Omit<PricingRecommendation, 'formattedRecommendation'> {
    return {
      featureName: productConcept.title,
      generatedDate: new Date().toISOString().split('T')[0],
      valueMetric: {
        proposedModel: 'Hybrid (Seats + Usage-Based Meter)',
        rationale: 'Usage-based pricing aligns revenue with customer value delivered, reduces upfront friction, and drives natural expansion',
        primaryMeter: 'Seats (baseline adoption)',
        secondaryMeter: `${this.inferUsageUnit(productConcept)} (scales with value)`
      },
      packaging: {
        recommendedTier: 'Professional Plan',
        expansionPath: 'Add-on packs for heavy users with transparent overage visibility',
        benchmarkInsight: 'Best-in-class SaaS companies use tiered packaging with transparent usage meters to drive upgrade momentum'
      },
      pricingPage: {
        snippet: this.generateDefaultPricingSnippet(productConcept),
        bestPractices: ['Clear tier names', 'Transparent meter thresholds', 'Contact Sales path', 'FAQ section']
      },
      experiments: [
        {
          description: 'Usage pack sizes optimization (1k vs. 5k vs. 10k units)',
          successMetric: 'Expansion revenue ↑ without >5% increase in churn complaints'
        },
        {
          description: 'Annual plan perk comparison (discount vs. feature rollover)',
          successMetric: 'Equal or improved annual adoption with better LTV'
        }
      ],
      annualIncentives: {
        recommendedPerks: ['Usage credit rollover', 'Priority support', 'Early access to new features'],
        maxDiscountPercent: 15,
        benchmarkInsight: 'Perks often outperform discounts in boosting conversion and long-term retention'
      },
      priceChangePlaybook: {
        rationale: 'New features deliver measurable ROI and enhanced customer outcomes',
        gracePeriod: '6 months for existing customers',
        grandfatheringPolicy: 'Retain legacy pricing for accounts under revenue threshold',
        churnRiskMitigation: 'Predict churn risk by segment; prepare save-offer bundles'
      },
      openQuestions: [
        'What is the customer willingness-to-pay (WTP) range for this solution?',
        'Do marginal costs (especially infrastructure) justify current usage pricing?',
        'Should advanced features default to bundled or add-on model?'
      ]
    };
  }
}