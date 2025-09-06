import { MarketResearchAgent } from './MarketResearchAgent';
import { CompetitiveLandscapeAgent } from './CompetitiveLandscapeAgent';
import { PrototypeGeneratorAgent } from './PrototypeGeneratorAgent';
import { DocumentPackageAgent } from './DocumentPackageAgent';
import { EvaluationAgent } from './EvaluationAgent';
import { MultiModelAI } from '../services/MultiModelAI';
import { 
  ProductConceptSchema, 
  ExtendedProductConceptSchema,
  validateInput,
  type ProductConcept,
  type ExtendedProductConcept
} from '../validation/schemas';
import { 
  AgenticError, 
  ErrorCode, 
  Logger,
  withRetry,
  withFallback
} from '../utils/errorHandling';
import { OpenAI } from 'openai';

// ============================================================================
// ORCHESTRATOR INTERFACES
// ============================================================================

export interface AgenticPMWorkflowRequest {
  productConcept: ProductConcept | ExtendedProductConcept;
  workflowOptions?: {
    includeMarketResearch?: boolean;
    includeCompetitiveAnalysis?: boolean;
    includePrototype?: boolean;
    includeEvaluation?: boolean;
    evaluationModels?: string[];
    exportFormat?: 'pdf' | 'markdown' | 'notion';
  };
  userPreferences?: {
    detailLevel?: 'basic' | 'comprehensive' | 'executive';
    focusAreas?: string[];
    constraints?: string[];
  };
}

export interface AgenticPMWorkflowResult {
  requestId: string;
  productTitle: string;
  executiveSummary: string;
  
  // Core deliverables
  productRequirementsDocument?: any;
  marketResearchReport?: any;
  competitiveLandscapeAnalysis?: any;
  prototypeSpecifications?: any;
  businessCase?: any;
  
  // Quality assessment
  evaluationReport?: any;
  
  // Metadata
  workflowMetadata: {
    startTime: string;
    endTime: string;
    duration: number;
    stepsCompleted: string[];
    stepsSkipped: string[];
    errors: any[];
    warnings: any[];
  };
  
  // Export options
  documentPackage?: {
    pdfPath?: string;
    markdownPath?: string;
    notionUrl?: string;
  };
}

// ============================================================================
// AGENTIC PM ORCHESTRATOR
// ============================================================================

export class AgenticPMOrchestrator {
  private marketResearchAgent: MarketResearchAgent;
  private competitiveLandscapeAgent: CompetitiveLandscapeAgent;
  private prototypeGeneratorAgent: PrototypeGeneratorAgent;
  private documentPackageAgent: DocumentPackageAgent;
  private evaluationAgent: EvaluationAgent;
  private multiModelAI: MultiModelAI;
  private openai: OpenAI;
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
    
    // Initialize OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new AgenticError(
        ErrorCode.AUTHENTICATION_ERROR,
        'OPENAI_API_KEY environment variable is required',
        'OpenAI API key is not configured. Please contact support.'
      );
    }
    this.openai = new OpenAI({ apiKey: openaiApiKey });

    // Initialize agents
    this.marketResearchAgent = new MarketResearchAgent(this.openai);
    this.competitiveLandscapeAgent = new CompetitiveLandscapeAgent(this.openai);
    this.prototypeGeneratorAgent = new PrototypeGeneratorAgent(this.openai, './prototypes');
    this.documentPackageAgent = new DocumentPackageAgent(this.openai, './documents');
    this.evaluationAgent = new EvaluationAgent();
    this.multiModelAI = new MultiModelAI();
  }

  async runCompleteWorkflow(request: AgenticPMWorkflowRequest): Promise<AgenticPMWorkflowResult> {
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
      throw new AgenticError(
        ErrorCode.VALIDATION_ERROR,
        `Product concept validation failed: ${validationResult.error!.message}`,
        'Please check your product concept format.',
        { validationError: validationResult.error }
      );
    }

    const validatedConcept = validationResult.data!;
    const options = this.getDefaultWorkflowOptions(request.workflowOptions);
    
    const result: AgenticPMWorkflowResult = {
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

      result.productRequirementsDocument = await this.generatePRD(validatedConcept, request.userPreferences);
      result.workflowMetadata.stepsCompleted.push('PRD Generation');

      // Step 2: Market Research (optional)
      if (options.includeMarketResearch) {
        this.logger.info('Conducting market research analysis', {
          productTitle: validatedConcept.title
        }, 'AgenticPMOrchestrator');

        try {
          result.marketResearchReport = await this.marketResearchAgent.conductMarketResearch({
            productTitle: validatedConcept.title,
            productDescription: validatedConcept.description,
            targetMarket: validatedConcept.targetMarket,
            geography: 'Global'
          });
          result.workflowMetadata.stepsCompleted.push('Market Research');
        } catch (error) {
          this.logger.warn('Market research failed, continuing without it', {
            error: (error as Error).message
          }, 'AgenticPMOrchestrator');
          result.workflowMetadata.errors.push({ step: 'Market Research', error: (error as Error).message });
          result.workflowMetadata.stepsSkipped.push('Market Research');
        }
      } else {
        result.workflowMetadata.stepsSkipped.push('Market Research');
      }

      // Step 3: Competitive Analysis (optional)
      if (options.includeCompetitiveAnalysis) {
        this.logger.info('Analyzing competitive landscape', {
          productTitle: validatedConcept.title
        }, 'AgenticPMOrchestrator');

        try {
          result.competitiveLandscapeAnalysis = await this.competitiveLandscapeAgent.analyzeCompetitiveLandscape({
            productTitle: validatedConcept.title,
            productDescription: validatedConcept.description,
            targetMarket: validatedConcept.targetMarket,
            geography: 'Global'
          });
          result.workflowMetadata.stepsCompleted.push('Competitive Analysis');
        } catch (error) {
          this.logger.warn('Competitive analysis failed, continuing without it', {
            error: (error as Error).message
          }, 'AgenticPMOrchestrator');
          result.workflowMetadata.errors.push({ step: 'Competitive Analysis', error: (error as Error).message });
          result.workflowMetadata.stepsSkipped.push('Competitive Analysis');
        }
      } else {
        result.workflowMetadata.stepsSkipped.push('Competitive Analysis');
      }

      // Step 4: Prototype Generation (optional)
      if (options.includePrototype) {
        this.logger.info('Generating prototype specifications', {
          productTitle: validatedConcept.title
        }, 'AgenticPMOrchestrator');

        try {
          const prototypeRequirements = this.buildPrototypeRequirements(validatedConcept);
          result.prototypeSpecifications = await this.prototypeGeneratorAgent.generatePrototype(prototypeRequirements);
          result.workflowMetadata.stepsCompleted.push('Prototype Generation');
        } catch (error) {
          this.logger.warn('Prototype generation failed, continuing without it', {
            error: (error as Error).message
          }, 'AgenticPMOrchestrator');
          result.workflowMetadata.errors.push({ step: 'Prototype Generation', error: (error as Error).message });
          result.workflowMetadata.stepsSkipped.push('Prototype Generation');
        }
      } else {
        result.workflowMetadata.stepsSkipped.push('Prototype Generation');
      }

      // Step 5: Business Case Generation
      this.logger.info('Generating business case', {
        productTitle: validatedConcept.title
      }, 'AgenticPMOrchestrator');

      result.businessCase = await this.generateBusinessCase(validatedConcept, result);
      result.workflowMetadata.stepsCompleted.push('Business Case');

      // Step 6: Executive Summary Generation
      this.logger.info('Generating executive summary', {
        productTitle: validatedConcept.title
      }, 'AgenticPMOrchestrator');

      result.executiveSummary = await this.generateExecutiveSummary(validatedConcept, result);
      result.workflowMetadata.stepsCompleted.push('Executive Summary');

      // Step 7: Evaluation (optional)
      if (options.includeEvaluation && options.evaluationModels && options.evaluationModels.length > 0) {
        this.logger.info('Running multi-model evaluation', {
          productTitle: validatedConcept.title,
          models: options.evaluationModels
        }, 'AgenticPMOrchestrator');

        try {
          result.evaluationReport = await this.evaluationAgent.evaluateProductAnalysis({
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
        } catch (error) {
          this.logger.warn('Evaluation failed, continuing without it', {
            error: (error as Error).message
          }, 'AgenticPMOrchestrator');
          result.workflowMetadata.errors.push({ step: 'Evaluation', error: (error as Error).message });
          result.workflowMetadata.stepsSkipped.push('Evaluation');
        }
      } else {
        result.workflowMetadata.stepsSkipped.push('Multi-Model Evaluation');
      }

      // Step 8: Document Package Generation (optional)
      if (options.exportFormat) {
        this.logger.info('Generating document package', {
          productTitle: validatedConcept.title,
          format: options.exportFormat
        }, 'AgenticPMOrchestrator');

        try {
          const documentPackage = await this.documentPackageAgent.createComprehensivePackage(
            validatedConcept.title,
            {
              prd: result.productRequirementsDocument,
              marketResearch: result.marketResearchReport,
              competitiveLandscape: result.competitiveLandscapeAnalysis,
              prototype: result.prototypeSpecifications
            },
            {
              format: options.exportFormat,
              template: request.userPreferences?.detailLevel === 'executive' ? 'executive' : 'technical'
            }
          );
          result.documentPackage = { [options.exportFormat + 'Path']: documentPackage };
          result.workflowMetadata.stepsCompleted.push('Document Package');
        } catch (error) {
          this.logger.warn('Document package generation failed', {
            error: (error as Error).message
          }, 'AgenticPMOrchestrator');
          result.workflowMetadata.errors.push({ step: 'Document Package', error: (error as Error).message });
          result.workflowMetadata.stepsSkipped.push('Document Package');
        }
      } else {
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

    } catch (error) {
      const endTime = new Date();
      result.workflowMetadata.endTime = endTime.toISOString();
      result.workflowMetadata.duration = endTime.getTime() - startTime.getTime();
      result.workflowMetadata.errors.push({ step: 'Workflow', error: (error as Error).message });

      this.logger.error('Agentic PM workflow failed', error as Error, {
        productTitle: validatedConcept.title,
        stepsCompleted: result.workflowMetadata.stepsCompleted,
        duration: result.workflowMetadata.duration
      }, 'AgenticPMOrchestrator');

      if (error instanceof AgenticError) {
        throw error;
      }

      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        `Agentic PM workflow failed: ${(error as Error).message}`,
        'The product analysis workflow could not be completed. Please try again.',
        { productTitle: validatedConcept.title, originalError: (error as Error).message },
        true
      );
    }
  }

  private validateProductConcept(concept: any) {
    // Try extended schema first, then fall back to basic schema
    const extendedResult = validateInput(ExtendedProductConceptSchema, concept, 'Extended Product Concept');
    if (extendedResult.success) {
      return extendedResult;
    }

    return validateInput(ProductConceptSchema, concept, 'Product Concept');
  }

  private getDefaultWorkflowOptions(options?: AgenticPMWorkflowRequest['workflowOptions']) {
    return {
      includeMarketResearch: options?.includeMarketResearch ?? true,
      includeCompetitiveAnalysis: options?.includeCompetitiveAnalysis ?? true,
      includePrototype: options?.includePrototype ?? false,
      includeEvaluation: options?.includeEvaluation ?? true,
      evaluationModels: options?.evaluationModels ?? this.multiModelAI.getAvailableModels().slice(0, 2),
      exportFormat: options?.exportFormat ?? 'pdf'
    };
  }

  private async generatePRD(concept: ProductConcept | ExtendedProductConcept, preferences?: any): Promise<any> {
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

    const response = await withRetry(async () => {
      return await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4000
      });
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new AgenticError(
        ErrorCode.GENERATION_FAILED,
        'Failed to generate PRD content',
        'PRD generation failed. Please try again.'
      );
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
    } catch (error) {
      // Fallback to text-based PRD
      return {
        title: concept.title,
        content: content,
        generatedAt: new Date().toISOString(),
        type: 'text-based-prd'
      };
    }
  }

  private buildPrototypeRequirements(concept: ProductConcept | ExtendedProductConcept): any {
    const extendedConcept = concept as ExtendedProductConcept;
    
    return {
      productTitle: concept.title,
      productDescription: concept.description,
      targetUsers: concept.targetUsers || ['General users'],
      keyFeatures: concept.keyFeatures || concept.goals,
      platform: extendedConcept.platform || 'web',
      designStyle: extendedConcept.designStyle || 'modern'
    };
  }

  private async generateBusinessCase(concept: ProductConcept | ExtendedProductConcept, analysisResults: any): Promise<any> {
    const prompt = `
As a business strategist, create a comprehensive business case for:

PRODUCT: ${concept.title}
DESCRIPTION: ${concept.description}
TARGET MARKET: ${concept.targetMarket}

ANALYSIS RESULTS:
${JSON.stringify({
  marketResearch: analysisResults.marketResearchReport ? 'Available' : 'Not available',
  competitiveAnalysis: analysisResults.competitiveLandscapeAnalysis ? 'Available' : 'Not available',
  prdSummary: analysisResults.productRequirementsDocument?.title || 'Generated'
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

    const response = await withRetry(async () => {
      return await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 3000
      });
    });

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
    } catch (error) {
      return { content, type: 'text-based' };
    }
  }

  private async generateExecutiveSummary(concept: ProductConcept | ExtendedProductConcept, analysisResults: any): Promise<string> {
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

    const response = await withRetry(async () => {
      return await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      });
    });

    return response.choices[0].message.content || 'Executive summary generation failed.';
  }

  // Utility method to get available evaluation models
  getAvailableEvaluationModels(): string[] {
    return this.multiModelAI.getAvailableModels();
  }

  // Test method to verify all integrations
  async testIntegrations(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    try {
      // Test OpenAI connection
      const testResponse = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: 'Respond with: Connection test successful' }],
        max_tokens: 50
      });
      results.openai = testResponse.choices[0].message.content?.includes('successful') || false;
    } catch (error) {
      results.openai = false;
    }

    // Test multi-model AI
    try {
      const modelTests = await this.multiModelAI.testConnectivity();
      results.multiModelAI = Object.values(modelTests).some(success => success);
      Object.assign(results, modelTests);
    } catch (error) {
      results.multiModelAI = false;
    }

    return results;
  }
}