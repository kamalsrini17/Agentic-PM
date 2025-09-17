/**
 * Agent Registry - Manages real agent instances for workflow execution
 * Replaces simulated agent execution with actual agent calls
 */

import { MarketResearchAgent } from '../agents/MarketResearchAgent';
import { CompetitiveLandscapeAgent } from '../agents/CompetitiveLandscapeAgent';
import { DocumentPackageAgent } from '../agents/DocumentPackageAgent';
import { PrototypeGeneratorAgent } from '../agents/PrototypeGeneratorAgent';
import { PricingAgent } from '../agents/PricingAgent';
import { PromptProcessorAgent } from '../agents/PromptProcessorAgent';
import { OptimizedEvalsAgent } from '../evaluation/OptimizedEvalsAgent';
import { Logger, AgenticError, ErrorCode } from '../utils/errorHandling';
import { OpenAI } from 'openai';

export class AgentRegistry {
  private agents: Map<string, any> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
    this.initializeAgents();
  }

  private initializeAgents(): void {
    try {
      // Initialize OpenAI client
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new AgenticError(
          ErrorCode.AUTHENTICATION_ERROR,
          'OPENAI_API_KEY environment variable is required for agent execution',
          'OpenAI API key is not configured. Please contact support.'
        );
      }
      const openai = new OpenAI({ apiKey: openaiApiKey });

      // Initialize ALL real agent instances
      this.agents.set('MarketResearchAgent', new MarketResearchAgent(openai));
      this.agents.set('CompetitiveLandscapeAgent', new CompetitiveLandscapeAgent(openai));
      this.agents.set('DocumentPackageAgent', new DocumentPackageAgent(openai));
      this.agents.set('PrototypeGeneratorAgent', new PrototypeGeneratorAgent(openai));
      this.agents.set('PricingAgent', new PricingAgent()); // Uses MultiModelAI internally
      this.agents.set('PromptProcessorAgent', new PromptProcessorAgent()); // Uses MultiModelAI internally
      this.agents.set('OptimizedEvalsAgent', new OptimizedEvalsAgent());

      this.logger.info(`Initialized ${this.agents.size} real agents`, {
        agents: Array.from(this.agents.keys())
      }, 'AgentRegistry');

    } catch (error) {
      this.logger.error('Failed to initialize agents', error as Error, {}, 'AgentRegistry');
      throw error;
    }
  }

  getAgent(agentType: string): any {
    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new AgenticError(
        ErrorCode.VALIDATION_ERROR,
        `Agent ${agentType} not found in registry`,
        `The requested agent type ${agentType} is not available.`
      );
    }
    return agent;
  }

  isAgentAvailable(agentType: string): boolean {
    return this.agents.has(agentType);
  }

  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Execute real agent method based on agent type and prepared inputs
   */
  async executeAgent(
    agentType: string,
    inputs: Record<string, any>,
    stepId: string
  ): Promise<any> {
    const agent = this.getAgent(agentType);
    
    this.logger.info(`Executing real agent: ${agentType}`, {
      stepId,
      agentType,
      inputKeys: Object.keys(inputs)
    }, 'AgentRegistry');

    // Verbose output for debugging
    const verbose = process.env.VERBOSE_ANALYSIS === 'true';
    if (verbose) {
      console.log(`\n🤖 EXECUTING AGENT: ${agentType}`);
      console.log(`📋 Step ID: ${stepId}`);
      console.log(`📥 Input Keys: ${Object.keys(inputs).join(', ')}`);
    }

    try {
      switch (agentType) {
        case 'PromptProcessorAgent':
          const promptInput = {
            rawPrompt: inputs.userPrompt || inputs.rawPrompt || `Analyze product: ${inputs.productTitle}`,
            additionalContext: inputs.productDescription || inputs.additionalContext,
            userPreferences: {
              detailLevel: inputs.depth || inputs.detailLevel || 'detailed',
              focusAreas: inputs.keyFeatures || inputs.focusAreas || [],
              constraints: inputs.constraints || []
            }
          };
          const promptResult = await agent.processPrompt(promptInput);
          if (verbose) {
            console.log(`📤 PromptProcessorAgent Output:`);
            console.log(`   Title: ${promptResult.title}`);
            console.log(`   Description: ${promptResult.description?.substring(0, 100)}...`);
            console.log(`   Target Market: ${promptResult.targetMarket}`);
            console.log(`   Key Features: ${promptResult.keyFeatures?.slice(0, 3).join(', ')}`);
          }
          return promptResult;

        case 'MarketResearchAgent':
          const marketInput = {
            productTitle: inputs.productTitle || inputs.title,
            productDescription: inputs.productDescription || inputs.description,
            targetMarket: inputs.targetMarket,
            geography: inputs.geography || 'Global',
            keyFeatures: inputs.keyFeatures || [],
            goals: inputs.goals || [],
            // Include structured concept from PromptProcessorAgent if available
            ...(inputs.previousResults?.['prompt-processing'] || {})
          };
          const marketResult = await agent.conductMarketResearch(marketInput);
          if (verbose) {
            console.log(`📤 MarketResearchAgent Output:`);
            console.log(`   Executive Summary: ${marketResult.ExecutiveSummary?.substring(0, 150)}...`);
            console.log(`   Market Opportunity: ${marketResult.MarketOpportunityAssessment?.substring(0, 100)}...`);
            console.log(`   Key Success Metrics: ${Object.keys(marketResult.KeySuccessMetrics || {}).join(', ')}`);
          }
          return marketResult;

        case 'CompetitiveLandscapeAgent':
          const competitiveInput = {
            productTitle: inputs.productTitle || inputs.title,
            productDescription: inputs.productDescription || inputs.description,
            targetMarket: inputs.targetMarket,
            geography: inputs.geography || 'Global',  // Fix: Add missing geography field
            keyFeatures: inputs.keyFeatures || [],
            // Include structured concept from PromptProcessorAgent if available
            ...(inputs.previousResults?.['prompt-processing'] || {})
          };
          
          if (verbose) {
            console.log(`📤 CompetitiveLandscapeAgent Input:`);
            console.log(`   Product Title: ${competitiveInput.productTitle}`);
            console.log(`   Target Market: ${competitiveInput.targetMarket}`);
            console.log(`   Geography: ${competitiveInput.geography}`);
            console.log(`   🔄 Calling CompetitiveLandscapeAgent.analyzeCompetitiveLandscape...`);
          }
          
          const competitiveResult = await agent.analyzeCompetitiveLandscape(competitiveInput);
          
          if (verbose) {
            console.log(`📤 CompetitiveLandscapeAgent Output:`);
            console.log(`   Market Overview: ${competitiveResult.marketOverview?.substring(0, 100)}...`);
            console.log(`   Direct Competitors: ${competitiveResult.directCompetitors?.length || 0} found`);
            console.log(`   Market Gaps: ${competitiveResult.marketGaps?.length || 0} identified`);
          }
          
          return competitiveResult;

        case 'DocumentPackageAgent':
          const documentInput = {
            productConcept: {
              title: inputs.productTitle || inputs.title,
              description: inputs.productDescription || inputs.description,
              targetMarket: inputs.targetMarket,
              keyFeatures: inputs.keyFeatures || [],
              goals: inputs.goals || []
            },
            marketResearch: inputs.previousResults?.['market-research'] || inputs.previousResults?.['comprehensive-market-research'],
            competitiveAnalysis: inputs.previousResults?.['competitive-analysis'] || inputs.previousResults?.['detailed-competitive-analysis'],
            promptProcessingResult: inputs.previousResults?.['prompt-processing'],
            template: inputs.template || 'standard',
            includeFinancials: inputs.includeFinancials || false
          };
          if (verbose) {
            console.log(`📤 DocumentPackageAgent Input:`);
            console.log(`   Product Title: ${documentInput.productConcept?.title}`);
            console.log(`   Has Market Research: ${!!documentInput.marketResearch}`);
            console.log(`   Has Competitive Analysis: ${!!documentInput.competitiveAnalysis}`);
            console.log(`   Has Prompt Processing: ${!!documentInput.promptProcessingResult}`);
            console.log(`   🔄 Calling DocumentPackageAgent.createComprehensivePackage...`);
          }
          
          const docResult = await agent.createComprehensivePackage(
            documentInput.productConcept?.title || 'Product Analysis', 
            {
              prd: documentInput,
              marketResearch: documentInput.marketResearch,
              competitiveLandscape: documentInput.competitiveAnalysis,
              prototype: documentInput.promptProcessingResult
            }, 
            { format: 'pdf', template: 'technical' }
          );
          
          if (verbose) {
            console.log(`📤 DocumentPackageAgent Output:`);
            console.log(`   Executive Summary Length: ${docResult.executiveSummary?.length || 0}`);
            console.log(`   Business Case Length: ${docResult.businessCase?.length || 0}`);
            console.log(`   Implementation Roadmap Length: ${docResult.implementationRoadmap?.length || 0}`);
          }
          
          return docResult;

        case 'PrototypeGeneratorAgent':
          const prototypeInput = {
            prdDocument: inputs.previousResults?.['prd-generation'] || inputs.previousResults?.['advanced-prd-generation'],
            productConcept: {
              title: inputs.productTitle || inputs.title,
              description: inputs.productDescription || inputs.description,
              targetMarket: inputs.targetMarket,
              keyFeatures: inputs.keyFeatures || []
            },
            fidelity: inputs.fidelity || 'medium',
            includeInteractions: inputs.includeInteractions || false
          };
          return await agent.generatePrototype(prototypeInput);

        case 'PricingAgent':
          const pricingInput = {
            prdDocument: inputs.previousResults?.['prd-generation'] || inputs.previousResults?.['advanced-prd-generation'],
            productConcept: {
              title: inputs.productTitle || inputs.title,
              description: inputs.productDescription || inputs.description,
              targetMarket: inputs.targetMarket,
              keyFeatures: inputs.keyFeatures || []
            },
            analysisContext: inputs.analysisId || stepId
          };
          return await agent.generatePricingRecommendations(pricingInput);

        case 'OptimizedEvalsAgent':
          const evaluationInput = {
            productConcept: {
              title: inputs.productTitle || inputs.title,
              description: inputs.productDescription || inputs.description,
              targetMarket: inputs.targetMarket,
              keyFeatures: inputs.keyFeatures || []
            },
            analysisResults: {
              marketResearch: inputs.previousResults?.['market-research'] || inputs.previousResults?.['comprehensive-market-research'],
              competitiveAnalysis: inputs.previousResults?.['competitive-analysis'] || inputs.previousResults?.['detailed-competitive-analysis'],
              prdDocument: inputs.previousResults?.['prd-generation'] || inputs.previousResults?.['advanced-prd-generation'],
              prototypeSpecs: inputs.previousResults?.['prototype-generation'] || inputs.previousResults?.['prototype-development'],
              pricingStrategy: inputs.previousResults?.['pricing-analysis']
            },
            evaluationModels: inputs.evaluationModels || ['gpt-4'],
            includeRiskAnalysis: inputs.includeRiskAnalysis || false,
            costBudget: inputs.costBudget,
            latencyTarget: inputs.latencyTarget
          };
          return await agent.evaluateWithOptimization(evaluationInput);

        default:
          throw new AgenticError(
            ErrorCode.VALIDATION_ERROR,
            `Unknown agent type: ${agentType}`,
            `Agent type ${agentType} is not supported.`
          );
      }

    } catch (error) {
      this.logger.error(`Agent execution failed: ${agentType}`, error as Error, {
        stepId,
        agentType
      }, 'AgentRegistry');
      throw error;
    }
  }
}