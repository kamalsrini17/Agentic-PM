import { MultiModelAI, MultiModelRequest, MultiModelResponse } from '../services/MultiModelAI';
import { Logger, AgenticError, ErrorCode, withRetry } from '../utils/errorHandling';
import { validateInput } from '../validation/schemas';
import { z } from 'zod';

// ============================================================================
// EVALUATION SCHEMAS
// ============================================================================

const EvaluationRequestSchema = z.object({
  productAnalysisPackage: z.object({
    executiveSummary: z.string(),
    productRequirementsDocument: z.any(),
    marketResearchReport: z.any(),
    competitiveLandscapeAnalysis: z.any(),
    prototypeSpecifications: z.any().optional(),
    businessCase: z.any().optional()
  }),
  evaluationModels: z.array(z.string()).min(1, "At least one evaluation model required"),
  scoringWeights: z.object({
    contentQuality: z.number().min(0).max(1),
    marketResearch: z.number().min(0).max(1),
    strategicSoundness: z.number().min(0).max(1),
    implementationReadiness: z.number().min(0).max(1)
  }).optional()
});

// ============================================================================
// EVALUATION INTERFACES
// ============================================================================

export interface EvaluationDimension {
  score: number; // 0-100
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export interface ModelEvaluation {
  model: string;
  overallScore: number; // 0-100
  confidence: number; // 0-100
  dimensions: {
    contentQuality: EvaluationDimension;
    marketResearch: EvaluationDimension;
    strategicSoundness: EvaluationDimension;
    implementationReadiness: EvaluationDimension;
  };
  executionTime: number;
  cost: number;
}

export interface ConsensusEvaluation {
  consensusScore: number;
  confidence: number;
  agreementLevel: number; // How much models agree (0-100)
  bestModel: string;
  worstModel: string;
  
  aggregatedDimensions: {
    contentQuality: EvaluationDimension;
    marketResearch: EvaluationDimension;
    strategicSoundness: EvaluationDimension;
    implementationReadiness: EvaluationDimension;
  };
  
  disagreementAreas: string[];
  modelComparison: Record<string, {
    score: number;
    rank: number;
    strengths: string[];
    uniqueInsights: string[];
  }>;
}

export interface FinalEvaluationReport {
  timestamp: string;
  productTitle: string;
  evaluationSummary: {
    overallScore: number;
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    recommendation: 'Proceed Aggressively' | 'Proceed with Caution' | 'Revise Significantly' | 'Restart Analysis';
  };
  
  modelEvaluations: Record<string, ModelEvaluation>;
  consensusEvaluation: ConsensusEvaluation;
  
  actionableRecommendations: {
    critical: Array<{ issue: string; solution: string; priority: number }>;
    important: Array<{ issue: string; solution: string; priority: number }>;
    suggestions: Array<{ issue: string; solution: string; priority: number }>;
  };
  
  nextSteps: string[];
  qualityGates: {
    passed: string[];
    failed: string[];
    warnings: string[];
  };
}

// ============================================================================
// EVALUATION AGENT
// ============================================================================

export class EvaluationAgent {
  private multiModelAI: MultiModelAI;
  private logger: Logger;
  
  // Default scoring weights
  private defaultWeights = {
    contentQuality: 0.40,
    marketResearch: 0.25,
    strategicSoundness: 0.20,
    implementationReadiness: 0.15
  };

  constructor() {
    this.multiModelAI = new MultiModelAI();
    this.logger = Logger.getInstance();
  }

  async evaluateProductAnalysis(input: unknown): Promise<FinalEvaluationReport> {
    const requestId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.logger.setContext(requestId);

    this.logger.info('Starting comprehensive product analysis evaluation', {
      inputKeys: Object.keys(input as any)
    }, 'EvaluationAgent');

    // Validate input
    const validationResult = validateInput(EvaluationRequestSchema, input, 'Evaluation Request');
    if (!validationResult.success) {
      throw new AgenticError(
        ErrorCode.VALIDATION_ERROR,
        `Evaluation input validation failed: ${validationResult.error!.message}`,
        'Please check your evaluation request format.',
        { validationError: validationResult.error }
      );
    }

    const validatedInput = validationResult.data!;
    const productTitle = this.extractProductTitle(validatedInput.productAnalysisPackage);
    const scoringWeights = validatedInput.scoringWeights || this.defaultWeights;

    try {
      // Step 1: Run parallel evaluations across all models
      this.logger.info('Running parallel model evaluations', {
        models: validatedInput.evaluationModels,
        productTitle
      }, 'EvaluationAgent');

      const modelEvaluations = await this.runParallelEvaluations(
        validatedInput.productAnalysisPackage,
        validatedInput.evaluationModels,
        scoringWeights
      );

      // Step 2: Generate consensus evaluation
      this.logger.info('Generating consensus evaluation', {
        successfulEvaluations: Object.keys(modelEvaluations).length
      }, 'EvaluationAgent');

      const consensusEvaluation = this.generateConsensusEvaluation(
        modelEvaluations,
        scoringWeights
      );

      // Step 3: Create actionable recommendations
      const actionableRecommendations = this.generateActionableRecommendations(
        consensusEvaluation,
        modelEvaluations
      );

      // Step 4: Determine quality gates and next steps
      const qualityGates = this.assessQualityGates(consensusEvaluation);
      const nextSteps = this.generateNextSteps(consensusEvaluation, qualityGates);

      // Step 5: Compile final report
      const finalReport: FinalEvaluationReport = {
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

    } catch (error) {
      this.logger.error('Product analysis evaluation failed', error as Error, {
        productTitle,
        models: validatedInput.evaluationModels
      }, 'EvaluationAgent');

      if (error instanceof AgenticError) {
        throw error;
      }

      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        `Evaluation failed: ${(error as Error).message}`,
        'Product analysis evaluation could not be completed. Please try again.',
        { productTitle, originalError: (error as Error).message },
        true
      );
    }
  }

  private async runParallelEvaluations(
    analysisPackage: any,
    models: string[],
    weights: any
  ): Promise<Record<string, ModelEvaluation>> {
    const evaluationPrompt = this.buildEvaluationPrompt(analysisPackage, weights);
    
    const multiModelRequest: MultiModelRequest = {
      prompt: evaluationPrompt,
      models,
      systemPrompt: this.getEvaluationSystemPrompt(),
      temperature: 0.3,
      maxTokens: 4000
    };

    const multiModelResponse = await this.multiModelAI.queryMultipleModels(multiModelRequest);
    const modelEvaluations: Record<string, ModelEvaluation> = {};

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
        
      } catch (error) {
        this.logger.warn(`Failed to parse evaluation from ${modelName}`, {
          error: (error as Error).message,
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
      throw new AgenticError(
        ErrorCode.GENERATION_FAILED,
        'All model evaluations failed',
        'Unable to evaluate the product analysis. Please try again.',
        { 
          requestedModels: models,
          errors: Object.keys(multiModelResponse.errors)
        },
        true
      );
    }

    return modelEvaluations;
  }

  private buildEvaluationPrompt(analysisPackage: any, weights: any): string {
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

  private getEvaluationSystemPrompt(): string {
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

  private parseEvaluationResponse(content: string, modelName: string): ModelEvaluation {
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

    } catch (error) {
      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        `Failed to parse evaluation from ${modelName}: ${(error as Error).message}`,
        `Unable to process evaluation from ${modelName}.`,
        { modelName, contentLength: content.length }
      );
    }
  }

  private validateDimension(dimension: any): EvaluationDimension {
    return {
      score: Math.max(0, Math.min(100, dimension?.score || 0)),
      reasoning: dimension?.reasoning || 'No reasoning provided',
      strengths: Array.isArray(dimension?.strengths) ? dimension.strengths : [],
      weaknesses: Array.isArray(dimension?.weaknesses) ? dimension.weaknesses : [],
      improvements: Array.isArray(dimension?.improvements) ? dimension.improvements : []
    };
  }

  private generateConsensusEvaluation(
    modelEvaluations: Record<string, ModelEvaluation>,
    weights: any
  ): ConsensusEvaluation {
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
    const bestModel = models.reduce((best, current) => 
      modelEvaluations[current].overallScore > modelEvaluations[best].overallScore ? current : best
    );
    const worstModel = models.reduce((worst, current) => 
      modelEvaluations[current].overallScore < modelEvaluations[worst].overallScore ? current : worst
    );

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

  private aggregateDimensions(evaluations: ModelEvaluation[]): ConsensusEvaluation['aggregatedDimensions'] {
    const dimensions = ['contentQuality', 'marketResearch', 'strategicSoundness', 'implementationReadiness'] as const;
    const result: any = {};

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

  private identifyDisagreementAreas(modelEvaluations: Record<string, ModelEvaluation>): string[] {
    const disagreements: string[] = [];
    const dimensions = ['contentQuality', 'marketResearch', 'strategicSoundness', 'implementationReadiness'] as const;

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

  private createModelComparison(modelEvaluations: Record<string, ModelEvaluation>): Record<string, any> {
    const models = Object.keys(modelEvaluations);
    const sortedModels = models.sort((a, b) => 
      modelEvaluations[b].overallScore - modelEvaluations[a].overallScore
    );

    const comparison: Record<string, any> = {};

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

  private extractModelStrengths(evaluation: ModelEvaluation, allEvaluations: Record<string, ModelEvaluation>): string[] {
    const strengths: string[] = [];
    
    // Find dimensions where this model scored highest
    const dimensions = ['contentQuality', 'marketResearch', 'strategicSoundness', 'implementationReadiness'] as const;
    
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

  private extractUniqueInsights(
    modelName: string, 
    evaluation: ModelEvaluation, 
    allEvaluations: Record<string, ModelEvaluation>
  ): string[] {
    // This is a simplified version - in a real implementation, you'd use NLP
    // to identify truly unique insights by comparing improvement suggestions
    const uniqueInsights: string[] = [];
    
    const allImprovements = Object.values(allEvaluations)
      .filter(e => e.model !== modelName)
      .flatMap(e => Object.values(e.dimensions).flatMap(d => d.improvements));
    
    const thisImprovements = Object.values(evaluation.dimensions).flatMap(d => d.improvements);
    
    for (const improvement of thisImprovements) {
      const isUnique = !allImprovements.some(other => 
        improvement.toLowerCase().includes(other.toLowerCase().substring(0, 20))
      );
      if (isUnique) {
        uniqueInsights.push(improvement);
      }
    }

    return uniqueInsights.slice(0, 3); // Top 3 unique insights
  }

  private generateActionableRecommendations(
    consensus: ConsensusEvaluation,
    modelEvaluations: Record<string, ModelEvaluation>
  ): FinalEvaluationReport['actionableRecommendations'] {
    const critical: Array<{ issue: string; solution: string; priority: number }> = [];
    const important: Array<{ issue: string; solution: string; priority: number }> = [];
    const suggestions: Array<{ issue: string; solution: string; priority: number }> = [];

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
      } else if (dimension.score < 80) {
        // Important issues (score 60-79)
        dimension.improvements.slice(0, 3).forEach((improvement, index) => {
          important.push({
            issue: `${dimensionName}: Room for improvement`,
            solution: improvement,
            priority: 80 - dimension.score + index
          });
        });
      } else {
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

  private assessQualityGates(consensus: ConsensusEvaluation): FinalEvaluationReport['qualityGates'] {
    const passed: string[] = [];
    const failed: string[] = [];
    const warnings: string[] = [];

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
      } else if (gate.score >= gate.threshold - 10) {
        warnings.push(`${gate.name}: ${gate.score}/100 (threshold: ${gate.threshold}) - Close to threshold`);
      } else {
        failed.push(`${gate.name}: ${gate.score}/100 (threshold: ${gate.threshold}) - Below threshold`);
      }
    }

    return { passed, failed, warnings };
  }

  private generateNextSteps(
    consensus: ConsensusEvaluation,
    qualityGates: FinalEvaluationReport['qualityGates']
  ): string[] {
    const nextSteps: string[] = [];

    if (qualityGates.failed.length > 0) {
      nextSteps.push('Address critical quality gate failures before proceeding');
      nextSteps.push('Conduct focused analysis on lowest-scoring dimensions');
    }

    if (consensus.consensusScore >= 80) {
      nextSteps.push('Proceed with implementation planning');
      nextSteps.push('Begin stakeholder alignment and resource allocation');
    } else if (consensus.consensusScore >= 70) {
      nextSteps.push('Address identified improvements before proceeding');
      nextSteps.push('Consider additional market validation');
    } else {
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

  private calculateGrade(score: number): FinalEvaluationReport['evaluationSummary']['grade'] {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateRecommendation(
    score: number, 
    qualityGates: FinalEvaluationReport['qualityGates']
  ): FinalEvaluationReport['evaluationSummary']['recommendation'] {
    if (score >= 85 && qualityGates.failed.length === 0) {
      return 'Proceed Aggressively';
    } else if (score >= 75 && qualityGates.failed.length <= 1) {
      return 'Proceed with Caution';
    } else if (score >= 60) {
      return 'Revise Significantly';
    } else {
      return 'Restart Analysis';
    }
  }

  private extractProductTitle(analysisPackage: any): string {
    // Try to extract product title from various sources
    if (analysisPackage.executiveSummary) {
      const titleMatch = analysisPackage.executiveSummary.match(/^(.+?)\s*[-–—]/);
      if (titleMatch) return titleMatch[1].trim();
    }
    
    if (analysisPackage.productRequirementsDocument?.title) {
      return analysisPackage.productRequirementsDocument.title;
    }
    
    if (analysisPackage.productRequirementsDocument?.product) {
      return analysisPackage.productRequirementsDocument.product;
    }

    return 'Unknown Product';
  }

  // Utility method to test evaluation with a sample
  async testEvaluation(): Promise<any> {
    const samplePackage = {
      executiveSummary: "Test Product - A sample product for testing evaluation",
      productRequirementsDocument: { title: "Test Product", description: "Sample PRD" },
      marketResearchReport: { tam: 1000000000, sam: 100000000 },
      competitiveLandscapeAnalysis: { competitors: [] },
      prototypeSpecifications: { components: [] }
    };

    const availableModels = this.multiModelAI.getAvailableModels();
    if (availableModels.length === 0) {
      throw new AgenticError(
        ErrorCode.AUTHENTICATION_ERROR,
        'No AI models available for evaluation',
        'Please configure API keys for OpenAI or Anthropic.'
      );
    }

    return await this.evaluateProductAnalysis({
      productAnalysisPackage: samplePackage,
      evaluationModels: availableModels.slice(0, 2) // Use first 2 available models
    });
  }
}