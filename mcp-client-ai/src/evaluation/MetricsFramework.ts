/**
 * Comprehensive Evaluation Framework for Agentic PM System
 * Designed by Principal PM with PLG and AI PM experience
 */

// ============================================================================
// PRODUCT QUALITY METRICS
// ============================================================================

interface DocumentQualityMetrics {
  // Content Quality Scores (0-100)
  completenessScore: number;        // % of required sections filled
  clarityScore: number;             // AI-assessed readability and clarity
  actionabilityScore: number;       // % of items with clear next steps
  specificityScore: number;         // Ratio of specific vs generic statements
  
  // Structure Quality
  organizationScore: number;        // Logical flow and structure
  consistencyScore: number;         // Internal consistency check
  
  // Market Research Quality
  researchDepth: number;           // Number of data points and sources
  insightNovelty: number;          // Uniqueness of insights (vs templates)
  competitiveAccuracy: number;     // Accuracy of competitor analysis
  
  // Overall Quality
  overallQuality: number;          // Weighted composite score
  qualityTrend: 'improving' | 'stable' | 'declining';
}

interface PRDQualityEvaluator {
  // Required Sections Completeness
  problemStatement: boolean;
  solutionOverview: boolean;
  userStories: boolean;
  requirements: boolean;
  successMetrics: boolean;
  timeline: boolean;
  
  // Advanced Sections
  competitiveAnalysis: boolean;
  marketSizing: boolean;
  riskAnalysis: boolean;
  
  // Quality Indicators
  hasQuantifiedGoals: boolean;
  hasUserPersonas: boolean;
  hasAcceptanceCriteria: boolean;
  hasRollbackPlan: boolean;
}

// ============================================================================
// USER ENGAGEMENT METRICS
// ============================================================================

interface UserEngagementMetrics {
  // Activation Metrics
  signupToFirstDocument: number;    // Time in minutes
  firstDocumentCompletion: number;  // % who complete first workflow
  timeToAhaMonent: number;          // Minutes to first successful PRD
  
  // Usage Depth  
  averageSessionDuration: number;   // Minutes per session
  documentsPerUser: number;         // Avg docs created per user
  iterationsPerDocument: number;    // Avg revisions per document
  featuresUsedPerSession: number;   // Breadth of feature usage
  
  // Retention Metrics
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  userRetention7Day: number;        // % users returning after 7 days
  userRetention30Day: number;       // % users returning after 30 days
  userRetention90Day: number;       // % users returning after 90 days
  
  // Engagement Quality
  shareRate: number;                // % docs shared with others
  collaborationRate: number;        // % docs with multiple contributors
  exportRate: number;               // % docs exported/downloaded
  feedbackSubmissionRate: number;   // % users providing feedback
}

// ============================================================================
// PLG GROWTH METRICS
// ============================================================================

interface PLGGrowthMetrics {
  // Acquisition Metrics
  organicSignupRate: number;        // % signups from organic channels
  referralRate: number;             // % signups from referrals
  contentViralCoefficient: number;  // Shares per piece of content
  
  // Activation Metrics  
  activationRate: number;           // % completing core workflow
  timeToValue: number;              // Minutes to first value
  featureAdoptionRate: Record<string, number>; // % adopting each feature
  
  // Expansion Metrics
  upgradeRate: number;              // % free users upgrading
  featureExpansionRate: number;     // % using advanced features
  teamInviteRate: number;           // Avg invites sent per user
  
  // Retention & Growth
  netRevenueRetention: number;      // Revenue retention + expansion
  viralCoefficient: number;         // K-factor for user growth
  paybackPeriod: number;            // Months to recover CAC
  
  // Network Effects
  networkDensity: number;           // Connections per user
  collaborativeDocuments: number;   // % docs with multiple users
  communityEngagement: number;      // Activity in community features
}

// ============================================================================
// AI SYSTEM PERFORMANCE METRICS  
// ============================================================================

interface AIPerformanceMetrics {
  // Response Quality
  responseRelevance: number;        // Human-rated relevance (1-5)
  responseAccuracy: number;         // Factual accuracy score
  responseCompleteness: number;     // Coverage of requested information
  
  // Generation Metrics
  averageGenerationTime: number;    // Seconds to generate response
  successfulGenerations: number;    // % requests completed successfully
  errorRate: number;               // % requests with errors
  
  // User Satisfaction
  thumbsUpRate: number;            // % positive user feedback
  regenerationRate: number;        // % users requesting regeneration
  manualEditRate: number;          // % outputs manually edited
  
  // Model Performance
  tokenEfficiency: number;         // Useful tokens / total tokens
  costPerDocument: number;         // Average cost to generate
  latencyP95: number;              // 95th percentile response time
  
  // Learning & Improvement
  feedbackIncorporationRate: number; // % feedback leading to improvements
  modelDriftDetection: number;      // Performance degradation over time
}

// ============================================================================
// BUSINESS IMPACT METRICS
// ============================================================================

interface BusinessImpactMetrics {
  // Productivity Gains
  timeToCreatePRD: number;          // Hours saved vs manual process
  iterationSpeed: number;           // Days saved in iteration cycles
  researchEfficiency: number;       // Hours saved on market research
  
  // Quality Improvements
  stakeholderApprovalRate: number;  // % PRDs approved without major changes
  implementationSuccess: number;    // % PRDs leading to successful products
  customerSatisfactionScore: number; // CSAT for final products
  
  // Business Outcomes
  revenuePerUser: number;          // Average revenue per user
  customerLifetimeValue: number;    // CLV calculation
  churnRate: number;               // Monthly churn rate
  netPromoterScore: number;        // NPS score
  
  // Market Impact
  marketShareGrowth: number;       // % market share captured
  competitiveWins: number;         // Deals won vs competitors
  thoughtLeadership: number;       // Industry recognition metrics
}

// ============================================================================
// EVALUATION FRAMEWORK CLASS
// ============================================================================

export class AgenticPMEvaluationFramework {
  private metrics: {
    documentQuality: DocumentQualityMetrics;
    userEngagement: UserEngagementMetrics;
    plgGrowth: PLGGrowthMetrics;
    aiPerformance: AIPerformanceMetrics;
    businessImpact: BusinessImpactMetrics;
  };

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  // ============================================================================
  // DOCUMENT QUALITY EVALUATION
  // ============================================================================

  async evaluateDocumentQuality(document: any): Promise<DocumentQualityMetrics> {
    const completeness = this.calculateCompleteness(document);
    const clarity = await this.assessClarity(document);
    const actionability = this.assessActionability(document);
    const specificity = this.assessSpecificity(document);
    
    return {
      completenessScore: completeness,
      clarityScore: clarity,
      actionabilityScore: actionability,
      specificityScore: specificity,
      organizationScore: this.assessOrganization(document),
      consistencyScore: this.assessConsistency(document),
      researchDepth: this.assessResearchDepth(document),
      insightNovelty: this.assessInsightNovelty(document),
      competitiveAccuracy: this.assessCompetitiveAccuracy(document),
      overallQuality: this.calculateOverallQuality({
        completeness, clarity, actionability, specificity
      }),
      qualityTrend: this.calculateQualityTrend(document.userId)
    };
  }

  private calculateCompleteness(document: any): number {
    const requiredSections = [
      'problemStatement', 'solutionOverview', 'userStories', 
      'requirements', 'successMetrics', 'timeline'
    ];
    
    const presentSections = requiredSections.filter(section => 
      document.content[section] && document.content[section].length > 0
    );
    
    return (presentSections.length / requiredSections.length) * 100;
  }

  private async assessClarity(document: any): Promise<number> {
    // AI-powered clarity assessment
    const textContent = this.extractTextContent(document);
    
    // Metrics for clarity assessment
    const avgSentenceLength = this.calculateAverageSentenceLength(textContent);
    const readabilityScore = this.calculateReadabilityScore(textContent);
    const jargonDensity = this.calculateJargonDensity(textContent);
    
    // Weighted scoring
    const clarityScore = (
      (readabilityScore * 0.5) +
      (this.scoreSentenceLength(avgSentenceLength) * 0.3) +
      (this.scoreJargonDensity(jargonDensity) * 0.2)
    );
    
    return Math.min(100, Math.max(0, clarityScore));
  }

  // ============================================================================
  // PLG METRICS CALCULATION
  // ============================================================================

  calculateViralCoefficient(
    invitesSent: number,
    invitesAccepted: number,
    totalUsers: number
  ): number {
    const inviteRate = invitesSent / totalUsers;
    const conversionRate = invitesAccepted / invitesSent;
    return inviteRate * conversionRate;
  }

  calculateNetworkEffects(userData: any[]): number {
    const collaborativeUsers = userData.filter(user => 
      user.collaborativeDocuments > 0
    ).length;
    
    const totalConnections = userData.reduce((sum, user) => 
      sum + user.connections, 0
    );
    
    const networkDensity = totalConnections / (userData.length * (userData.length - 1));
    const collaborationRate = collaborativeUsers / userData.length;
    
    return (networkDensity * 0.6) + (collaborationRate * 0.4);
  }

  // ============================================================================
  // SUCCESS METRIC BENCHMARKS
  // ============================================================================

  getSuccessMetricBenchmarks(): Record<string, any> {
    return {
      // Activation Benchmarks
      activationRate: {
        poor: 10,
        good: 25,
        excellent: 40,
        worldClass: 60
      },
      
      // Retention Benchmarks
      retention30Day: {
        poor: 15,
        good: 30,
        excellent: 50,
        worldClass: 70
      },
      
      // Quality Benchmarks
      documentQuality: {
        poor: 60,
        good: 75,
        excellent: 85,
        worldClass: 95
      },
      
      // Growth Benchmarks
      monthlyGrowthRate: {
        poor: 5,
        good: 15,
        excellent: 25,
        worldClass: 40
      },
      
      // Efficiency Benchmarks
      timeToValue: {
        worldClass: 15,  // minutes
        excellent: 30,
        good: 60,
        poor: 120
      }
    };
  }

  // ============================================================================
  // COMPREHENSIVE HEALTH SCORE
  // ============================================================================

  calculateHealthScore(metrics: any): {
    overall: number;
    category_scores: Record<string, number>;
    recommendations: string[];
  } {
    const weights = {
      userEngagement: 0.3,
      documentQuality: 0.25,
      plgGrowth: 0.25,
      aiPerformance: 0.15,
      businessImpact: 0.05
    };

    const categoryScores = {
      userEngagement: this.scoreUserEngagement(metrics.userEngagement),
      documentQuality: this.scoreDocumentQuality(metrics.documentQuality),
      plgGrowth: this.scorePLGGrowth(metrics.plgGrowth),
      aiPerformance: this.scoreAIPerformance(metrics.aiPerformance),
      businessImpact: this.scoreBusinessImpact(metrics.businessImpact)
    };

    const overall = Object.entries(categoryScores).reduce(
      (sum, [category, score]) => sum + (score * weights[category as keyof typeof weights]),
      0
    );

    const recommendations = this.generateRecommendations(categoryScores);

    return {
      overall: Math.round(overall),
      category_scores: categoryScores,
      recommendations
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private initializeMetrics(): any {
    // Initialize all metric structures with default values
    return {
      documentQuality: {} as DocumentQualityMetrics,
      userEngagement: {} as UserEngagementMetrics,
      plgGrowth: {} as PLGGrowthMetrics,
      aiPerformance: {} as AIPerformanceMetrics,
      businessImpact: {} as BusinessImpactMetrics
    };
  }

  private extractTextContent(document: any): string {
    // Extract all text content from document for analysis
    return JSON.stringify(document.content).replace(/[{}",:]/g, ' ');
  }

  private calculateAverageSentenceLength(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const totalWords = text.split(/\s+/).length;
    return totalWords / sentences.length;
  }

  private calculateReadabilityScore(text: string): number {
    // Simplified Flesch Reading Ease calculation
    const avgSentenceLength = this.calculateAverageSentenceLength(text);
    const avgSyllablesPerWord = this.estimateAverageSyllables(text);
    
    return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  }

  private estimateAverageSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    const totalSyllables = words.reduce((sum, word) => {
      return sum + Math.max(1, word.replace(/[^aeiou]/g, '').length);
    }, 0);
    return totalSyllables / words.length;
  }

  private generateRecommendations(scores: Record<string, number>): string[] {
    const recommendations: string[] = [];
    
    if (scores.userEngagement < 70) {
      recommendations.push("Focus on improving user onboarding and activation flow");
    }
    
    if (scores.documentQuality < 80) {
      recommendations.push("Enhance AI prompts and add more quality validation checks");
    }
    
    if (scores.plgGrowth < 60) {
      recommendations.push("Implement viral features and referral programs");
    }
    
    return recommendations;
  }

  // Scoring methods for different categories
  private scoreUserEngagement(metrics: UserEngagementMetrics): number {
    // Implementation of user engagement scoring logic
    return 75; // Placeholder
  }

  private scoreDocumentQuality(metrics: DocumentQualityMetrics): number {
    // Implementation of document quality scoring logic  
    return 80; // Placeholder
  }

  private scorePLGGrowth(metrics: PLGGrowthMetrics): number {
    // Implementation of PLG growth scoring logic
    return 65; // Placeholder
  }

  private scoreAIPerformance(metrics: AIPerformanceMetrics): number {
    // Implementation of AI performance scoring logic
    return 85; // Placeholder
  }

  private scoreBusinessImpact(metrics: BusinessImpactMetrics): number {
    // Implementation of business impact scoring logic
    return 70; // Placeholder
  }

  // Additional helper methods for specific assessments
  private assessActionability(document: any): number { return 75; }
  private assessSpecificity(document: any): number { return 80; }
  private assessOrganization(document: any): number { return 85; }
  private assessConsistency(document: any): number { return 90; }
  private assessResearchDepth(document: any): number { return 70; }
  private assessInsightNovelty(document: any): number { return 65; }
  private assessCompetitiveAccuracy(document: any): number { return 75; }
  private calculateOverallQuality(scores: any): number { 
    return Object.values(scores).reduce((a: any, b: any) => a + b, 0) / Object.keys(scores).length;
  }
  private calculateQualityTrend(userId: string): 'improving' | 'stable' | 'declining' { 
    return 'improving'; 
  }
  private calculateJargonDensity(text: string): number { return 0.1; }
  private scoreSentenceLength(length: number): number { return 80; }
  private scoreJargonDensity(density: number): number { return 90; }
}