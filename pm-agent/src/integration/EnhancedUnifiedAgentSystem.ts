/**
 * Enhanced Unified Agent System
 * Integrates PromptProcessorAgent and document context with existing orchestration
 */

import { UnifiedAgentSystem, ComprehensiveAnalysisRequest, ComprehensiveAnalysisResult } from './UnifiedAgentSystem';
import { PromptProcessorAgent, UserPromptInput, ProcessedProductConcept } from '../agents/PromptProcessorAgent';
import { SessionDocumentStore, DocumentContext } from '../storage/SessionDocumentStore';
import { SimpleDocumentParser, ParsingOptions } from '../parsers/SimpleDocumentParser';
import { Logger, AgenticError, ErrorCode } from '../utils/errorHandling';

// ============================================================================
// ENHANCED INTERFACES
// ============================================================================

export interface EnhancedAnalysisRequest {
  // User prompt input
  userPrompt: string;
  additionalContext?: string;
  
  // Document context
  sessionId?: string;
  documentFiles?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
  
  // Analysis preferences
  analysisPreferences?: {
    detailLevel?: 'basic' | 'detailed' | 'comprehensive';
    focusAreas?: string[];
    constraints?: string[];
    prioritizeSpeed?: boolean;
    prioritizeCost?: boolean;
    prioritizeQuality?: boolean;
  };
  
  // Document processing options
  documentOptions?: {
    extractFeatures?: boolean;
    extractKeywords?: boolean;
    generateSummary?: boolean;
    useContextForPersonalization?: boolean;
  };
}

export interface EnhancedAnalysisResult extends ComprehensiveAnalysisResult {
  // Prompt processing results
  processedPrompt: ProcessedProductConcept;
  
  // Document context used
  documentContext?: {
    sessionId: string;
    documentsUsed: number;
    contextTypes: string[];
    relevantFeatures: string[];
    styleGuidelines: string[];
    constraints: string[];
  };
  
  // Personalization info
  personalization: {
    isPersonalized: boolean;
    personalizationScore: number;
    domainExpertise: string;
    contextInfluence: 'low' | 'medium' | 'high';
    consistencyCheck: {
      featureAlignment: number;
      styleAlignment: number;
      technicalAlignment: number;
    };
  };
  
  // Enhanced recommendations
  contextualRecommendations: Array<{
    category: 'consistency' | 'enhancement' | 'optimization' | 'validation';
    title: string;
    description: string;
    basedOnDocument?: string;
    confidence: number;
  }>;
}

// ============================================================================
// ENHANCED UNIFIED AGENT SYSTEM
// ============================================================================

export class EnhancedUnifiedAgentSystem extends UnifiedAgentSystem {
  private promptProcessor: PromptProcessorAgent;
  private documentStore: SessionDocumentStore;
  private documentParser: SimpleDocumentParser;
  private enhancedLogger: Logger;

  constructor(config?: any) {
    super(config);
    
    this.promptProcessor = new PromptProcessorAgent();
    this.documentStore = new SessionDocumentStore();
    this.documentParser = new SimpleDocumentParser();
    this.enhancedLogger = Logger.getInstance();

    this.enhancedLogger.info('Enhanced Unified Agent System initialized', {
      hasPromptProcessor: true,
      hasDocumentStore: true,
      hasDocumentParser: true
    }, 'EnhancedUnifiedAgentSystem');
  }

  // ============================================================================
  // ENHANCED ANALYSIS METHODS
  // ============================================================================

  async analyzeWithPromptAndContext(request: EnhancedAnalysisRequest): Promise<EnhancedAnalysisResult> {
    const analysisId = `enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const startTime = Date.now();

    this.enhancedLogger.setContext(analysisId);
    this.enhancedLogger.info('Starting enhanced analysis with prompt and context', {
      hasPrompt: !!request.userPrompt,
      hasDocuments: !!request.documentFiles?.length,
      hasSession: !!request.sessionId
    }, 'EnhancedUnifiedAgentSystem');

    try {
      // Step 1: Process user documents (if provided)
      let sessionId = request.sessionId;
      let documentContext: DocumentContext[] = [];

      if (request.documentFiles && request.documentFiles.length > 0) {
        sessionId = await this.processDocuments(request.documentFiles, sessionId);
      }

      // Step 2: Process user prompt
      const promptInput: UserPromptInput = {
        rawPrompt: request.userPrompt,
        additionalContext: request.additionalContext,
        userPreferences: {
          detailLevel: request.analysisPreferences?.detailLevel || 'detailed',
          focusAreas: request.analysisPreferences?.focusAreas,
          constraints: request.analysisPreferences?.constraints
        }
      };

      const processedPrompt = await this.promptProcessor.processPrompt(promptInput);

      // Step 3: Retrieve relevant document context
      if (sessionId && request.documentOptions?.useContextForPersonalization !== false) {
        documentContext = await this.documentStore.getRelevantContext(
          sessionId,
          request.userPrompt,
          ['features', 'requirements', 'domain_knowledge', 'style_guide']
        );
      }

      // Step 4: Enhance product concept with document context
      const enhancedConcept = this.enhanceConceptWithContext(processedPrompt, documentContext);

      // Step 5: Convert to standard analysis request
      const standardRequest = this.convertToStandardRequest(enhancedConcept, request);

      // Step 6: Run standard analysis
      const standardResult = await this.analyzeComprehensively(standardRequest);

      // Step 7: Enhance result with context and personalization
      const enhancedResult = await this.enhanceResultWithContext(
        standardResult,
        processedPrompt,
        documentContext,
        sessionId
      );

      const totalDuration = Date.now() - startTime;

      this.enhancedLogger.info('Enhanced analysis completed', {
        analysisId,
        duration: totalDuration,
        isPersonalized: enhancedResult.personalization.isPersonalized,
        documentsUsed: documentContext.length,
        overallScore: enhancedResult.summary.overallScore
      }, 'EnhancedUnifiedAgentSystem');

      return enhancedResult;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.enhancedLogger.error('Enhanced analysis failed', error as Error, {
        analysisId,
        duration,
        prompt: request.userPrompt.substring(0, 100)
      }, 'EnhancedUnifiedAgentSystem');

      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        `Enhanced analysis failed: ${(error as Error).message}`,
        'Unable to complete the enhanced analysis. Please try again.',
        { analysisId, originalPrompt: request.userPrompt },
        true
      );
    }
  }

  // ============================================================================
  // DOCUMENT PROCESSING
  // ============================================================================

  private async processDocuments(
    documentFiles: EnhancedAnalysisRequest['documentFiles'],
    existingSessionId?: string
  ): Promise<string> {
    const sessionId = existingSessionId || this.documentStore.createSession();

    for (const file of documentFiles!) {
      try {
        // Add document to store
        const documentId = await this.documentStore.addDocument(
          sessionId,
          file.filename,
          file.content,
          file.contentType
        );

        // Parse document
        const documentType = this.detectDocumentType(file.filename, file.contentType);
        const parseOptions: ParsingOptions = {
          extractFeatures: true,
          extractKeywords: true,
          generateSummary: true,
          extractEntities: false
        };

        const parsedContent = await this.documentParser.parseDocument(
          file.content,
          file.filename,
          documentType,
          parseOptions
        );

        // Update document with parsed data
        this.documentStore.updateDocumentParsedData(documentId, parsedContent);

        this.enhancedLogger.info('Document processed and stored', {
          sessionId,
          documentId,
          filename: file.filename,
          sectionsFound: parsedContent.sections.length,
          featuresFound: parsedContent.features?.length || 0
        }, 'EnhancedUnifiedAgentSystem');

      } catch (error) {
        this.enhancedLogger.warn('Failed to process document', {
          filename: file.filename,
          error: (error as Error).message
        }, 'EnhancedUnifiedAgentSystem');
      }
    }

    return sessionId;
  }

  private detectDocumentType(filename: string, contentType: string): 'pdf' | 'text' | 'markdown' | 'json' | 'unknown' {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'md': case 'markdown': return 'markdown';
      case 'json': return 'json';
      case 'txt': case 'text': return 'text';
      default:
        if (contentType.includes('pdf')) return 'pdf';
        if (contentType.includes('json')) return 'json';
        if (contentType.includes('markdown')) return 'markdown';
        return 'text';
    }
  }

  // ============================================================================
  // CONTEXT ENHANCEMENT
  // ============================================================================

  private enhanceConceptWithContext(
    concept: ProcessedProductConcept,
    documentContext: DocumentContext[]
  ): ProcessedProductConcept {
    if (documentContext.length === 0) {
      return concept;
    }

    const enhancedConcept = { ...concept };

    // Enhance features with context
    const contextFeatures = documentContext.flatMap(ctx => ctx.extractedInfo.features || []);
    if (contextFeatures.length > 0) {
      // Add unique context features that align with the concept
      const alignedFeatures = contextFeatures.filter(feature => 
        this.isFeatureAligned(feature, concept.domain, concept.keyFeatures)
      );
      
      enhancedConcept.keyFeatures = [
        ...concept.keyFeatures,
        ...alignedFeatures.slice(0, 5) // Add up to 5 aligned features
      ];
    }

    // Enhance constraints with context
    const contextConstraints = documentContext.flatMap(ctx => ctx.extractedInfo.constraints || []);
    if (contextConstraints.length > 0) {
      enhancedConcept.constraints = [
        ...concept.constraints,
        ...contextConstraints.slice(0, 3)
      ];
    }

    // Enhance description with domain-specific terminology
    const terminology = documentContext.reduce((acc, ctx) => {
      return { ...acc, ...ctx.extractedInfo.terminology };
    }, {} as Record<string, string>);

    if (Object.keys(terminology).length > 0) {
      enhancedConcept.description = this.enhanceDescriptionWithTerminology(
        concept.description,
        terminology
      );
    }

    // Boost confidence if we have good context
    const contextBoost = Math.min(15, documentContext.length * 5);
    enhancedConcept.confidenceScore = Math.min(100, concept.confidenceScore + contextBoost);

    return enhancedConcept;
  }

  private async enhanceResultWithContext(
    standardResult: ComprehensiveAnalysisResult,
    processedPrompt: ProcessedProductConcept,
    documentContext: DocumentContext[],
    sessionId?: string
  ): Promise<EnhancedAnalysisResult> {
    // Calculate personalization metrics
    const personalization = this.calculatePersonalizationMetrics(
      standardResult,
      documentContext
    );

    // Generate contextual recommendations
    const contextualRecommendations = this.generateContextualRecommendations(
      standardResult,
      documentContext
    );

    // Build document context summary
    const documentContextSummary = sessionId ? {
      sessionId,
      documentsUsed: documentContext.length,
      contextTypes: [...new Set(documentContext.map(ctx => ctx.contextType))],
      relevantFeatures: documentContext.flatMap(ctx => ctx.extractedInfo.features || []).slice(0, 10),
      styleGuidelines: documentContext.flatMap(ctx => ctx.extractedInfo.styleGuidelines || []).slice(0, 5),
      constraints: documentContext.flatMap(ctx => ctx.extractedInfo.constraints || []).slice(0, 5)
    } : undefined;

    const enhancedResult: EnhancedAnalysisResult = {
      ...standardResult,
      processedPrompt,
      documentContext: documentContextSummary,
      personalization,
      contextualRecommendations
    };

    return enhancedResult;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private convertToStandardRequest(
    concept: ProcessedProductConcept,
    request: EnhancedAnalysisRequest
  ): ComprehensiveAnalysisRequest {
    return {
      productConcept: {
        title: concept.title,
        description: concept.description,
        targetMarket: concept.targetMarket,
        keyFeatures: concept.keyFeatures,
        goals: concept.goals,
        constraints: concept.constraints
      },
      analysisType: concept.suggestedAnalysisType,
      constraints: {
        maxCost: request.analysisPreferences?.prioritizeCost ? 0.30 : undefined,
        maxDuration: request.analysisPreferences?.prioritizeSpeed ? 60000 : undefined,
        qualityThreshold: request.analysisPreferences?.prioritizeQuality ? 85 : undefined
      },
      preferences: {
        prioritizeSpeed: request.analysisPreferences?.prioritizeSpeed,
        prioritizeCost: request.analysisPreferences?.prioritizeCost,
        prioritizeQuality: request.analysisPreferences?.prioritizeQuality
      },
      evaluationDimensions: ['content-quality', 'market-research', 'strategic-soundness', 'implementation-readiness']
    };
  }

  private isFeatureAligned(feature: string, domain: string, existingFeatures: string[]): boolean {
    // Check if feature is already present
    if (existingFeatures.some(existing => 
      existing.toLowerCase().includes(feature.toLowerCase()) ||
      feature.toLowerCase().includes(existing.toLowerCase())
    )) {
      return false;
    }

    // Simple domain alignment check
    const domainKeywords: Record<string, string[]> = {
      'restaurant-tech': ['food', 'menu', 'order', 'kitchen', 'restaurant'],
      'e-commerce': ['shop', 'product', 'cart', 'payment', 'inventory'],
      'healthcare': ['patient', 'medical', 'health', 'doctor', 'clinic'],
      'productivity': ['task', 'project', 'team', 'workflow', 'collaboration']
    };

    const keywords = domainKeywords[domain] || [];
    return keywords.some(keyword => feature.toLowerCase().includes(keyword));
  }

  private enhanceDescriptionWithTerminology(
    description: string,
    terminology: Record<string, string>
  ): string {
    let enhanced = description;
    
    for (const [term, definition] of Object.entries(terminology)) {
      if (enhanced.toLowerCase().includes(term.toLowerCase()) && definition.length < 50) {
        // Could enhance with terminology, but keeping it simple for now
      }
    }

    return enhanced;
  }

  private calculatePersonalizationMetrics(
    result: ComprehensiveAnalysisResult,
    documentContext: DocumentContext[]
  ): EnhancedAnalysisResult['personalization'] {
    const isPersonalized = documentContext.length > 0;
    const personalizationScore = Math.min(100, documentContext.length * 20);
    
    // Determine domain expertise based on context
    const domainExpertise = documentContext.length > 0 
      ? documentContext[0].contextType 
      : 'general';

    // Calculate context influence
    let contextInfluence: 'low' | 'medium' | 'high' = 'low';
    if (documentContext.length > 3) contextInfluence = 'high';
    else if (documentContext.length > 1) contextInfluence = 'medium';

    // Calculate alignment scores
    const consistencyCheck = {
      featureAlignment: this.calculateFeatureAlignment(result, documentContext),
      styleAlignment: this.calculateStyleAlignment(result, documentContext),
      technicalAlignment: this.calculateTechnicalAlignment(result, documentContext)
    };

    return {
      isPersonalized,
      personalizationScore,
      domainExpertise,
      contextInfluence,
      consistencyCheck
    };
  }

  private generateContextualRecommendations(
    result: ComprehensiveAnalysisResult,
    documentContext: DocumentContext[]
  ): EnhancedAnalysisResult['contextualRecommendations'] {
    const recommendations: EnhancedAnalysisResult['contextualRecommendations'] = [];

    // Feature consistency recommendations
    for (const context of documentContext) {
      if (context.extractedInfo.features && context.extractedInfo.features.length > 0) {
        recommendations.push({
          category: 'consistency',
          title: 'Feature Alignment Opportunity',
          description: `Consider incorporating features from your existing documentation: ${context.extractedInfo.features.slice(0, 2).join(', ')}`,
          basedOnDocument: context.documentId,
          confidence: 0.8
        });
      }

      if (context.extractedInfo.constraints && context.extractedInfo.constraints.length > 0) {
        recommendations.push({
          category: 'validation',
          title: 'Constraint Validation',
          description: `Ensure the new product aligns with existing constraints: ${context.extractedInfo.constraints[0]}`,
          basedOnDocument: context.documentId,
          confidence: 0.9
        });
      }
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  private calculateFeatureAlignment(
    result: ComprehensiveAnalysisResult,
    documentContext: DocumentContext[]
  ): number {
    // Simplified alignment calculation
    const contextFeatures = documentContext.flatMap(ctx => ctx.extractedInfo.features || []);
    if (contextFeatures.length === 0) return 100;

    // This is a placeholder - in a real implementation, you'd use NLP to compare feature similarity
    return 75;
  }

  private calculateStyleAlignment(
    result: ComprehensiveAnalysisResult,
    documentContext: DocumentContext[]
  ): number {
    // Simplified style alignment calculation
    return 80;
  }

  private calculateTechnicalAlignment(
    result: ComprehensiveAnalysisResult,
    documentContext: DocumentContext[]
  ): number {
    // Simplified technical alignment calculation
    return 85;
  }

  // ============================================================================
  // PUBLIC CONVENIENCE METHODS
  // ============================================================================

  async quickAnalysisWithPrompt(userPrompt: string, documentFiles?: EnhancedAnalysisRequest['documentFiles']): Promise<EnhancedAnalysisResult> {
    return this.analyzeWithPromptAndContext({
      userPrompt,
      documentFiles,
      analysisPreferences: {
        detailLevel: 'basic',
        prioritizeSpeed: true
      },
      documentOptions: {
        useContextForPersonalization: true,
        extractFeatures: true,
        generateSummary: true
      }
    });
  }

  async comprehensiveAnalysisWithPrompt(userPrompt: string, documentFiles?: EnhancedAnalysisRequest['documentFiles']): Promise<EnhancedAnalysisResult> {
    return this.analyzeWithPromptAndContext({
      userPrompt,
      documentFiles,
      analysisPreferences: {
        detailLevel: 'comprehensive',
        prioritizeQuality: true
      },
      documentOptions: {
        useContextForPersonalization: true,
        extractFeatures: true,
        extractKeywords: true,
        generateSummary: true
      }
    });
  }

  // Document management methods
  createDocumentSession(): string {
    return this.documentStore.createSession();
  }

  async addDocumentToSession(sessionId: string, filename: string, content: string, contentType: string = 'text/plain'): Promise<string> {
    const documentId = await this.documentStore.addDocument(sessionId, filename, content, contentType);
    
    // Parse and update document
    const documentType = this.detectDocumentType(filename, contentType);
    const parsedContent = await this.documentParser.parseDocument(content, filename, documentType);
    this.documentStore.updateDocumentParsedData(documentId, parsedContent);
    
    return documentId;
  }

  getSessionDocuments(sessionId: string) {
    return this.documentStore.getSessionDocuments(sessionId);
  }

  clearDocumentSession(sessionId: string): boolean {
    return this.documentStore.clearSession(sessionId);
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    this.documentStore.shutdown();
    await super.shutdown();
  }
}