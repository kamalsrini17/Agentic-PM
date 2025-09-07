/**
 * Prompt Processor Agent
 * Transforms unstructured user prompts into structured product concepts
 */

import { MultiModelAI } from '../services/MultiModelAI';
import { Logger, AgenticError, ErrorCode } from '../utils/errorHandling';

// ============================================================================
// INTERFACES
// ============================================================================

export interface UserPromptInput {
  rawPrompt: string;
  additionalContext?: string;
  userPreferences?: {
    detailLevel?: 'basic' | 'detailed' | 'comprehensive';
    focusAreas?: string[];
    constraints?: string[];
  };
}

export interface ProcessedProductConcept {
  title: string;
  description: string;
  domain: string; // e.g., "restaurant-tech", "crm", "project-management"
  targetMarket: string;
  keyFeatures: string[];
  goals: string[];
  constraints: string[];
  inspirations: string[]; // "like Slack", "similar to Shopify"
  clarificationNeeded: string[]; // Questions for user
  confidenceScore: number; // How well we understood the prompt (0-100)
  suggestedAnalysisType: 'quick' | 'standard' | 'comprehensive';
  extractedKeywords: string[];
  metadata: {
    processedAt: Date;
    processingTime: number;
    modelUsed: string;
    promptLength: number;
  };
}

export interface ClarificationResponse {
  questions: Array<{
    question: string;
    category: 'target_market' | 'features' | 'constraints' | 'goals' | 'technical';
    priority: 'high' | 'medium' | 'low';
    suggestedAnswers?: string[];
  }>;
  missingElements: string[];
  confidenceImpact: number; // How much clarity would improve confidence
}

// ============================================================================
// PROMPT PROCESSOR AGENT
// ============================================================================

export class PromptProcessorAgent {
  private multiModelAI: MultiModelAI;
  private logger: Logger;

  // Domain knowledge for better classification
  private readonly DOMAIN_PATTERNS = {
    'restaurant-tech': ['restaurant', 'food', 'dining', 'menu', 'kitchen', 'hospitality', 'pos'],
    'e-commerce': ['shop', 'store', 'marketplace', 'product', 'cart', 'payment', 'inventory'],
    'healthcare': ['health', 'medical', 'patient', 'doctor', 'clinic', 'hospital', 'telemedicine'],
    'fintech': ['finance', 'banking', 'payment', 'investment', 'trading', 'cryptocurrency'],
    'education': ['learning', 'student', 'teacher', 'course', 'education', 'training', 'school'],
    'productivity': ['task', 'project', 'team', 'collaboration', 'workflow', 'management'],
    'social': ['social', 'community', 'networking', 'chat', 'messaging', 'sharing'],
    'enterprise': ['business', 'enterprise', 'corporate', 'b2b', 'saas', 'crm', 'erp'],
    'consumer': ['consumer', 'b2c', 'mobile', 'app', 'lifestyle', 'entertainment'],
    'ai-ml': ['ai', 'artificial intelligence', 'machine learning', 'automation', 'smart']
  };

  // Common feature patterns by domain
  private readonly FEATURE_PATTERNS = {
    'restaurant-tech': ['inventory management', 'order tracking', 'menu optimization', 'staff scheduling'],
    'e-commerce': ['product catalog', 'shopping cart', 'payment processing', 'order management'],
    'healthcare': ['appointment scheduling', 'patient records', 'telemedicine', 'billing'],
    'productivity': ['task management', 'team collaboration', 'file sharing', 'time tracking'],
    'social': ['user profiles', 'messaging', 'content sharing', 'social feeds']
  };

  constructor() {
    this.multiModelAI = new MultiModelAI();
    this.logger = Logger.getInstance();
  }

  // ============================================================================
  // MAIN PROCESSING METHODS
  // ============================================================================

  async processPrompt(input: UserPromptInput): Promise<ProcessedProductConcept> {
    const startTime = Date.now();
    const requestId = `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    this.logger.setContext(requestId);
    this.logger.info('Processing user prompt', {
      promptLength: input.rawPrompt.length,
      hasContext: !!input.additionalContext,
      preferences: input.userPreferences
    }, 'PromptProcessorAgent');

    try {
      // Step 1: Initial analysis and extraction
      const initialAnalysis = await this.performInitialAnalysis(input);
      
      // Step 2: Domain classification
      const domain = this.classifyDomain(input.rawPrompt, initialAnalysis.extractedKeywords);
      
      // Step 3: Feature inference based on domain
      const inferredFeatures = this.inferFeatures(domain, initialAnalysis.keyFeatures, input.rawPrompt);
      
      // Step 4: Generate structured concept
      const structuredConcept = await this.generateStructuredConcept(input, initialAnalysis, domain, inferredFeatures);
      
      // Step 5: Identify clarification needs
      const clarificationNeeded = this.identifyClarificationNeeds(structuredConcept);
      
      // Step 6: Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(structuredConcept, input);
      
      // Step 7: Suggest analysis type
      const suggestedAnalysisType = this.suggestAnalysisType(structuredConcept, input);

      const processingTime = Date.now() - startTime;
      
      const processedConcept: ProcessedProductConcept = {
        title: structuredConcept.title,
        description: structuredConcept.description,
        domain,
        targetMarket: structuredConcept.targetMarket,
        keyFeatures: inferredFeatures,
        goals: structuredConcept.goals,
        constraints: structuredConcept.constraints,
        inspirations: initialAnalysis.inspirations,
        clarificationNeeded,
        confidenceScore,
        suggestedAnalysisType,
        extractedKeywords: initialAnalysis.extractedKeywords,
        metadata: {
          processedAt: new Date(),
          processingTime,
          modelUsed: 'gpt-4-turbo-preview',
          promptLength: input.rawPrompt.length
        }
      };

      this.logger.info('Prompt processing completed', {
        requestId,
        title: processedConcept.title,
        domain: processedConcept.domain,
        confidenceScore: processedConcept.confidenceScore,
        processingTime
      }, 'PromptProcessorAgent');

      return processedConcept;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Prompt processing failed', error as Error, {
        requestId,
        promptLength: input.rawPrompt.length,
        processingTime
      }, 'PromptProcessorAgent');

      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        `Prompt processing failed: ${(error as Error).message}`,
        'Unable to process your idea. Please try rephrasing or providing more details.',
        { requestId, originalPrompt: input.rawPrompt },
        true
      );
    }
  }

  async generateClarificationQuestions(concept: ProcessedProductConcept): Promise<ClarificationResponse> {
    const questions: ClarificationResponse['questions'] = [];
    const missingElements: string[] = [];

    // Check for missing target market
    if (!concept.targetMarket || concept.targetMarket.length < 10) {
      questions.push({
        question: "Who is your primary target audience or customer?",
        category: 'target_market',
        priority: 'high',
        suggestedAnswers: this.getSuggestedTargetMarkets(concept.domain)
      });
      missingElements.push('target_market');
    }

    // Check for vague features
    if (concept.keyFeatures.length < 3) {
      questions.push({
        question: "What are the core features or capabilities you envision?",
        category: 'features',
        priority: 'high',
        suggestedAnswers: this.FEATURE_PATTERNS[concept.domain as keyof typeof this.FEATURE_PATTERNS] || []
      });
      missingElements.push('key_features');
    }

    // Check for missing goals
    if (concept.goals.length < 2) {
      questions.push({
        question: "What specific problems are you trying to solve or goals are you trying to achieve?",
        category: 'goals',
        priority: 'medium'
      });
      missingElements.push('goals');
    }

    // Check for constraints
    if (concept.constraints.length === 0) {
      questions.push({
        question: "Are there any technical, budget, or timeline constraints we should consider?",
        category: 'constraints',
        priority: 'medium',
        suggestedAnswers: ['Budget under $50k', 'Launch within 6 months', 'Mobile-first approach', 'Must integrate with existing systems']
      });
      missingElements.push('constraints');
    }

    // Domain-specific questions
    const domainQuestions = this.getDomainSpecificQuestions(concept.domain, concept);
    questions.push(...domainQuestions);

    const confidenceImpact = Math.min(30, questions.filter(q => q.priority === 'high').length * 10);

    return {
      questions: questions.slice(0, 5), // Limit to 5 questions
      missingElements,
      confidenceImpact
    };
  }

  // ============================================================================
  // ANALYSIS METHODS
  // ============================================================================

  private async performInitialAnalysis(input: UserPromptInput): Promise<{
    title: string;
    description: string;
    keyFeatures: string[];
    extractedKeywords: string[];
    inspirations: string[];
  }> {
    const analysisPrompt = `
Analyze this product idea and extract key information:

USER PROMPT: "${input.rawPrompt}"
${input.additionalContext ? `ADDITIONAL CONTEXT: "${input.additionalContext}"` : ''}

Extract the following information in JSON format:
{
  "title": "A concise product title (2-6 words)",
  "description": "A clear 1-2 sentence description",
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "extractedKeywords": ["keyword1", "keyword2", "keyword3"],
  "inspirations": ["existing products or services mentioned"]
}

Focus on:
- What the product does
- Key functionality mentioned
- Any comparisons to existing products
- Important keywords and domain terms
`;

    const response = await this.multiModelAI.queryMultipleModels({
      prompt: analysisPrompt,
      models: ['gpt-4-turbo-preview'],
      temperature: 0.3,
      maxTokens: 1000
    });

    const content = response.responses['gpt-4-turbo-preview']?.content;
    if (!content) {
      throw new Error('Failed to get initial analysis from AI model');
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || 'Untitled Product',
          description: parsed.description || input.rawPrompt.substring(0, 100),
          keyFeatures: Array.isArray(parsed.keyFeatures) ? parsed.keyFeatures : [],
          extractedKeywords: Array.isArray(parsed.extractedKeywords) ? parsed.extractedKeywords : [],
          inspirations: Array.isArray(parsed.inspirations) ? parsed.inspirations : []
        };
      }
    } catch (error) {
      this.logger.warn('Failed to parse initial analysis JSON', { error: (error as Error).message });
    }

    // Fallback to basic extraction
    return {
      title: this.extractTitle(input.rawPrompt),
      description: input.rawPrompt.substring(0, 200),
      keyFeatures: this.extractBasicFeatures(input.rawPrompt),
      extractedKeywords: this.extractKeywords(input.rawPrompt),
      inspirations: this.extractInspirations(input.rawPrompt)
    };
  }

  private classifyDomain(prompt: string, keywords: string[]): string {
    const lowercasePrompt = prompt.toLowerCase();
    const allTerms = [...keywords.map(k => k.toLowerCase()), ...lowercasePrompt.split(/\s+/)];

    let bestDomain = 'general';
    let bestScore = 0;

    for (const [domain, patterns] of Object.entries(this.DOMAIN_PATTERNS)) {
      const score = patterns.reduce((acc, pattern) => {
        const matches = allTerms.filter(term => term.includes(pattern) || pattern.includes(term));
        return acc + matches.length;
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain;
      }
    }

    return bestDomain;
  }

  private inferFeatures(domain: string, extractedFeatures: string[], prompt: string): string[] {
    const domainFeatures = this.FEATURE_PATTERNS[domain as keyof typeof this.FEATURE_PATTERNS] || [];
    const combinedFeatures = [...extractedFeatures];

    // Add domain-specific features if not already present
    for (const feature of domainFeatures) {
      const isAlreadyPresent = combinedFeatures.some(existing => 
        existing.toLowerCase().includes(feature.toLowerCase()) || 
        feature.toLowerCase().includes(existing.toLowerCase())
      );

      if (!isAlreadyPresent && combinedFeatures.length < 8) {
        // Check if the feature is relevant to the prompt
        if (this.isFeatureRelevant(feature, prompt)) {
          combinedFeatures.push(feature);
        }
      }
    }

    return combinedFeatures.slice(0, 8); // Limit to 8 features
  }

  private async generateStructuredConcept(
    input: UserPromptInput,
    analysis: any,
    domain: string,
    features: string[]
  ): Promise<{
    title: string;
    description: string;
    targetMarket: string;
    goals: string[];
    constraints: string[];
  }> {
    const structurePrompt = `
Based on this product idea, create a structured concept:

TITLE: ${analysis.title}
DESCRIPTION: ${analysis.description}
DOMAIN: ${domain}
FEATURES: ${features.join(', ')}
ORIGINAL PROMPT: ${input.rawPrompt}

Generate a structured concept in JSON format:
{
  "title": "Refined product title",
  "description": "Enhanced 2-3 sentence description",
  "targetMarket": "Specific target audience description",
  "goals": ["goal1", "goal2", "goal3"],
  "constraints": ["constraint1", "constraint2"]
}

Make it specific to the ${domain} domain and ensure the target market is well-defined.
`;

    const response = await this.multiModelAI.queryMultipleModels({
      prompt: structurePrompt,
      models: ['gpt-4-turbo-preview'],
      temperature: 0.3,
      maxTokens: 800
    });

    const content = response.responses['gpt-4-turbo-preview']?.content;
    if (!content) {
      throw new Error('Failed to generate structured concept');
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || analysis.title,
          description: parsed.description || analysis.description,
          targetMarket: parsed.targetMarket || 'General users',
          goals: Array.isArray(parsed.goals) ? parsed.goals : [],
          constraints: Array.isArray(parsed.constraints) ? parsed.constraints : []
        };
      }
    } catch (error) {
      this.logger.warn('Failed to parse structured concept JSON');
    }

    // Fallback
    return {
      title: analysis.title,
      description: analysis.description,
      targetMarket: this.inferTargetMarket(domain, input.rawPrompt),
      goals: this.inferGoals(input.rawPrompt),
      constraints: []
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private calculateConfidenceScore(concept: ProcessedProductConcept, input: UserPromptInput): number {
    let score = 50; // Base score

    // Title quality
    if (concept.title && concept.title.length > 3) score += 10;
    
    // Description quality
    if (concept.description && concept.description.length > 20) score += 10;
    
    // Target market specificity
    if (concept.targetMarket && concept.targetMarket.length > 10) score += 15;
    
    // Features count
    score += Math.min(20, concept.keyFeatures.length * 3);
    
    // Goals defined
    score += Math.min(10, concept.goals.length * 3);
    
    // Domain classification confidence
    if (concept.domain !== 'general') score += 10;
    
    // Prompt quality
    if (input.rawPrompt.length > 50) score += 5;
    if (input.rawPrompt.length > 100) score += 5;
    
    // Additional context
    if (input.additionalContext) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  private suggestAnalysisType(concept: ProcessedProductConcept, input: UserPromptInput): 'quick' | 'standard' | 'comprehensive' {
    if (input.userPreferences?.detailLevel === 'basic' || concept.confidenceScore < 60) {
      return 'quick';
    } else if (input.userPreferences?.detailLevel === 'comprehensive' || concept.confidenceScore > 85) {
      return 'comprehensive';
    } else {
      return 'standard';
    }
  }

  private identifyClarificationNeeds(concept: ProcessedProductConcept): string[] {
    const needs: string[] = [];

    if (!concept.targetMarket || concept.targetMarket.length < 10) {
      needs.push('Target market needs more specificity');
    }

    if (concept.keyFeatures.length < 3) {
      needs.push('More details needed about core features');
    }

    if (concept.goals.length < 2) {
      needs.push('Business goals and objectives should be clarified');
    }

    if (concept.domain === 'general') {
      needs.push('Product category or industry domain unclear');
    }

    return needs;
  }

  private getSuggestedTargetMarkets(domain: string): string[] {
    const suggestions: Record<string, string[]> = {
      'restaurant-tech': ['Restaurant owners', 'Food service managers', 'Chain restaurants', 'Independent restaurants'],
      'e-commerce': ['Online retailers', 'Small businesses', 'Enterprise merchants', 'Marketplace sellers'],
      'healthcare': ['Healthcare providers', 'Patients', 'Medical practices', 'Hospitals'],
      'productivity': ['Remote teams', 'Small businesses', 'Project managers', 'Freelancers'],
      'education': ['Students', 'Teachers', 'Educational institutions', 'Corporate training']
    };

    return suggestions[domain] || ['Small businesses', 'Enterprise customers', 'Individual consumers', 'Professional users'];
  }

  private getDomainSpecificQuestions(domain: string, concept: ProcessedProductConcept): ClarificationResponse['questions'] {
    const domainQuestions: Record<string, ClarificationResponse['questions']> = {
      'restaurant-tech': [
        {
          question: "What type of restaurants are you targeting? (fast-casual, fine dining, chains, etc.)",
          category: 'target_market',
          priority: 'medium'
        }
      ],
      'e-commerce': [
        {
          question: "What size businesses are you targeting? (small retailers, enterprise, marketplaces)",
          category: 'target_market',
          priority: 'medium'
        }
      ],
      'healthcare': [
        {
          question: "Are you targeting healthcare providers or patients directly?",
          category: 'target_market',
          priority: 'high'
        }
      ]
    };

    return domainQuestions[domain] || [];
  }

  // Basic extraction fallback methods
  private extractTitle(prompt: string): string {
    const sentences = prompt.split(/[.!?]+/);
    const firstSentence = sentences[0].trim();
    
    if (firstSentence.length < 50) {
      return firstSentence;
    }
    
    const words = firstSentence.split(/\s+/).slice(0, 6);
    return words.join(' ');
  }

  private extractBasicFeatures(prompt: string): string[] {
    const featureKeywords = ['feature', 'capability', 'function', 'tool', 'system', 'platform'];
    const sentences = prompt.split(/[.!?]+/);
    const features: string[] = [];

    for (const sentence of sentences) {
      if (featureKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        features.push(sentence.trim());
      }
    }

    return features.slice(0, 5);
  }

  private extractKeywords(prompt: string): string[] {
    const words = prompt.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }

  private extractInspirations(prompt: string): string[] {
    const inspirationPatterns = [
      /like\s+([a-zA-Z\s]+)/gi,
      /similar\s+to\s+([a-zA-Z\s]+)/gi,
      /based\s+on\s+([a-zA-Z\s]+)/gi
    ];

    const inspirations: string[] = [];
    
    for (const pattern of inspirationPatterns) {
      const matches = prompt.matchAll(pattern);
      for (const match of matches) {
        inspirations.push(match[1].trim());
      }
    }

    return inspirations;
  }

  private isFeatureRelevant(feature: string, prompt: string): boolean {
    const featureWords = feature.toLowerCase().split(/\s+/);
    const promptWords = prompt.toLowerCase().split(/\s+/);
    
    return featureWords.some(word => promptWords.includes(word));
  }

  private inferTargetMarket(domain: string, prompt: string): string {
    const domainTargets: Record<string, string> = {
      'restaurant-tech': 'Restaurant owners and managers',
      'e-commerce': 'Online retailers and merchants',
      'healthcare': 'Healthcare providers and patients',
      'productivity': 'Teams and project managers',
      'education': 'Students and educators'
    };

    return domainTargets[domain] || 'Business professionals';
  }

  private inferGoals(prompt: string): string[] {
    const goalKeywords = ['improve', 'increase', 'reduce', 'optimize', 'enhance', 'streamline', 'automate'];
    const sentences = prompt.split(/[.!?]+/);
    const goals: string[] = [];

    for (const sentence of sentences) {
      if (goalKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        goals.push(sentence.trim());
      }
    }

    return goals.length > 0 ? goals.slice(0, 3) : ['Improve user experience', 'Increase efficiency'];
  }
}