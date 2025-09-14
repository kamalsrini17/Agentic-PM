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
          return await agent.processPrompt(promptInput);

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
          return await agent.conductMarketResearch(marketInput);

        case 'CompetitiveLandscapeAgent':
          const competitiveInput = {
            productTitle: inputs.productTitle || inputs.title,
            productDescription: inputs.productDescription || inputs.description,
            targetMarket: inputs.targetMarket,
            keyFeatures: inputs.keyFeatures || [],
            // Include structured concept from PromptProcessorAgent if available
            ...(inputs.previousResults?.['prompt-processing'] || {})
          };
          return await agent.analyzeCompetitiveLandscape(competitiveInput);

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
          return await agent.generateDocumentPackage(documentInput);

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