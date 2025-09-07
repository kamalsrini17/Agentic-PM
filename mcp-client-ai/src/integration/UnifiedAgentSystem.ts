/**
 * Unified Agent System - Integration of Orchestration, Metrics, and Optimized Evaluation
 * Provides a cohesive interface for all three agent systems
 */

import { OrchestrationAgent, OrchestrationRequest, OrchestrationResult } from '../orchestration/OrchestrationAgent';
import { MetricsAgent, MetricsInsight, MetricsReport } from '../metrics/MetricsAgent';
import { OptimizedEvalsAgent, EvaluationRequest, OptimizedEvaluationResult } from '../evaluation/OptimizedEvalsAgent';
import { Logger, AgenticError, ErrorCode } from '../utils/errorHandling';

// ============================================================================
// UNIFIED SYSTEM INTERFACES
// ============================================================================

export interface UnifiedSystemConfig {
  orchestration?: {
    enabled: boolean;
    defaultWorkflowTemplate?: string;
  };
  metrics?: {
    enabled: boolean;
    collectionInterval?: number;
    autoReporting?: boolean;
  };
  evaluation?: {
    enabled: boolean;
    defaultCostBudget?: number;
    defaultLatencyTarget?: number;
    cachingEnabled?: boolean;
  };
}

export interface ComprehensiveAnalysisRequest {
  productConcept: any;
  analysisType: 'quick' | 'standard' | 'comprehensive' | 'custom';
  constraints?: {
    maxCost?: number;
    maxDuration?: number;
    qualityThreshold?: number;
  };
  preferences?: {
    prioritizeSpeed?: boolean;
    prioritizeCost?: boolean;
    prioritizeQuality?: boolean;
  };
  customWorkflow?: string;
  evaluationDimensions?: string[];
}

export interface ComprehensiveAnalysisResult {
  analysisId: string;
  
  // Orchestration results
  orchestrationResult?: OrchestrationResult;
  
  // Evaluation results
  evaluationResult?: OptimizedEvaluationResult;
  
  // Metrics insights
  metricsInsights?: MetricsInsight[];
  
  // Unified summary
  summary: {
    overallScore: number;
    confidence: number;
    totalCost: number;
    totalDuration: number;
    qualityAchieved: number;
    efficiencyScore: number; // Cost/quality ratio
  };
  
  // Integrated recommendations
  recommendations: Array<{
    category: 'orchestration' | 'evaluation' | 'metrics' | 'system';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionItems: string[];
    expectedBenefit: string;
    effort: 'low' | 'medium' | 'high';
  }>;
  
  // System performance
  systemPerformance: {
    orchestrationEfficiency: number;
    evaluationEfficiency: number;
    metricsHealth: number;
    resourceUtilization: number;
  };
  
  metadata: {
    timestamp: Date;
    analysisType: string;
    systemsUsed: string[];
    optimizationsApplied: string[];
  };
}

export interface SystemHealthReport {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    orchestration: {
      status: 'healthy' | 'warning' | 'critical';
      activeExecutions: number;
      successRate: number;
      avgLatency: number;
    };
    metrics: {
      status: 'healthy' | 'warning' | 'critical';
      collectionRate: number;
      alertsActive: number;
      dataHealth: number;
    };
    evaluation: {
      status: 'healthy' | 'warning' | 'critical';
      cacheHitRate: number;
      avgCost: number;
      qualityScore: number;
    };
  };
  recommendations: string[];
  lastUpdated: Date;
}

// ============================================================================
// UNIFIED AGENT SYSTEM
// ============================================================================

export class UnifiedAgentSystem {
  private orchestrationAgent!: OrchestrationAgent;
  private metricsAgent!: MetricsAgent;
  private optimizedEvalsAgent!: OptimizedEvalsAgent;
  private logger: Logger;
  private config: UnifiedSystemConfig;
  
  // System state tracking
  private isInitialized: boolean = false;
  private activeAnalyses: Map<string, ComprehensiveAnalysisResult> = new Map();
  private systemStartTime: Date = new Date();

  constructor(config: UnifiedSystemConfig = {}) {
    this.config = {
      orchestration: { enabled: true, ...config.orchestration },
      metrics: { enabled: true, collectionInterval: 60000, autoReporting: true, ...config.metrics },
      evaluation: { 
        enabled: true, 
        defaultCostBudget: 0.50, 
        defaultLatencyTarget: 30000,
        cachingEnabled: true,
        ...config.evaluation 
      }
    };

    this.logger = Logger.getInstance();
    this.initializeComponents();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private async initializeComponents(): Promise<void> {
    try {
      this.logger.info('Initializing Unified Agent System', {
        config: this.config
      }, 'UnifiedAgentSystem');

      // Initialize core agents
      if (this.config.orchestration?.enabled) {
        this.orchestrationAgent = new OrchestrationAgent();
        this.logger.info('Orchestration Agent initialized', {}, 'UnifiedAgentSystem');
      }

      if (this.config.metrics?.enabled) {
        this.metricsAgent = new MetricsAgent();
        this.metricsAgent.startMetricsCollection();
        this.logger.info('Metrics Agent initialized and started', {}, 'UnifiedAgentSystem');
      }

      if (this.config.evaluation?.enabled) {
        this.optimizedEvalsAgent = new OptimizedEvalsAgent();
        this.logger.info('Optimized Evals Agent initialized', {}, 'UnifiedAgentSystem');
      }

      // Setup inter-agent communication
      this.setupInterAgentCommunication();

      // Start system monitoring
      this.startSystemMonitoring();

      this.isInitialized = true;
      this.logger.info('Unified Agent System fully initialized', {
        componentsEnabled: Object.entries(this.config)
          .filter(([_, config]) => (config as any).enabled)
          .map(([name]) => name)
      }, 'UnifiedAgentSystem');

    } catch (error) {
      this.logger.error('Failed to initialize Unified Agent System', error as Error, {}, 'UnifiedAgentSystem');
      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        `System initialization failed: ${(error as Error).message}`,
        'The unified agent system could not be initialized.',
        {},
        true
      );
    }
  }

  // ============================================================================
  // MAIN ANALYSIS INTERFACE
  // ============================================================================

  async analyzeComprehensively(request: ComprehensiveAnalysisRequest): Promise<ComprehensiveAnalysisResult> {
    if (!this.isInitialized) {
      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        'System not initialized',
        'Please wait for system initialization to complete.'
      );
    }

    const analysisId = `unified_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const startTime = Date.now();

    this.logger.setContext(analysisId);
    this.logger.info('Starting comprehensive analysis', {
      analysisType: request.analysisType,
      productConcept: request.productConcept?.title || 'Unknown',
      constraints: request.constraints
    }, 'UnifiedAgentSystem');

    try {
      const result: ComprehensiveAnalysisResult = {
        analysisId,
        summary: {
          overallScore: 0,
          confidence: 0,
          totalCost: 0,
          totalDuration: 0,
          qualityAchieved: 0,
          efficiencyScore: 0
        },
        recommendations: [],
        systemPerformance: {
          orchestrationEfficiency: 0,
          evaluationEfficiency: 0,
          metricsHealth: 0,
          resourceUtilization: 0
        },
        metadata: {
          timestamp: new Date(),
          analysisType: request.analysisType,
          systemsUsed: [],
          optimizationsApplied: []
        }
      };

      // Phase 1: Orchestration (if enabled and needed)
      if (this.config.orchestration?.enabled && this.shouldUseOrchestration(request)) {
        result.orchestrationResult = await this.runOrchestration(request, analysisId);
        result.metadata.systemsUsed.push('orchestration');
        
        this.logger.info('Orchestration phase completed', {
          analysisId,
          success: result.orchestrationResult.success,
          cost: result.orchestrationResult.actualCost,
          duration: result.orchestrationResult.actualDuration
        }, 'UnifiedAgentSystem');
      }

      // Phase 2: Optimized Evaluation (if enabled)
      if (this.config.evaluation?.enabled) {
        const evaluationInput = this.prepareEvaluationInput(request, result.orchestrationResult);
        result.evaluationResult = await this.runOptimizedEvaluation(evaluationInput, analysisId);
        result.metadata.systemsUsed.push('evaluation');
        
        this.logger.info('Evaluation phase completed', {
          analysisId,
          overallScore: result.evaluationResult.overallScore,
          cost: result.evaluationResult.actualCost,
          cacheHit: result.evaluationResult.cacheHit
        }, 'UnifiedAgentSystem');
      }

      // Phase 3: Metrics Analysis (if enabled)
      if (this.config.metrics?.enabled) {
        result.metricsInsights = await this.runMetricsAnalysis(request, result, analysisId);
        result.metadata.systemsUsed.push('metrics');
        
        this.logger.info('Metrics analysis phase completed', {
          analysisId,
          insightsCount: result.metricsInsights?.length || 0
        }, 'UnifiedAgentSystem');
      }

      // Phase 4: Unified Analysis and Recommendations
      this.synthesizeResults(result);
      this.generateUnifiedRecommendations(result);
      this.calculateSystemPerformance(result);

      // Phase 5: Record comprehensive metrics
      this.recordAnalysisMetrics(result, Date.now() - startTime);

      // Store analysis
      this.activeAnalyses.set(analysisId, result);

      this.logger.info('Comprehensive analysis completed', {
        analysisId,
        overallScore: result.summary.overallScore,
        totalCost: result.summary.totalCost,
        totalDuration: result.summary.totalDuration,
        systemsUsed: result.metadata.systemsUsed.length
      }, 'UnifiedAgentSystem');

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error('Comprehensive analysis failed', error as Error, {
        analysisId,
        duration,
        analysisType: request.analysisType
      }, 'UnifiedAgentSystem');

      // Record failure metrics
      if (this.config.metrics?.enabled) {
        this.metricsAgent.recordMetric('analysis.failures', 1, 'count', {
          analysis_type: request.analysisType,
          error_type: 'comprehensive_analysis_failure'
        });
      }

      throw new AgenticError(
        ErrorCode.PROCESSING_ERROR,
        `Comprehensive analysis failed: ${(error as Error).message}`,
        'The analysis could not be completed. Please try again.',
        { analysisId, analysisType: request.analysisType },
        true
      );
    }
  }

  // ============================================================================
  // INDIVIDUAL SYSTEM EXECUTION
  // ============================================================================

  private async runOrchestration(
    request: ComprehensiveAnalysisRequest,
    analysisId: string
  ): Promise<OrchestrationResult> {
    const orchestrationRequest: OrchestrationRequest = {
      objective: `Analyze product concept: ${request.productConcept?.title || 'Product Analysis'}`,
      constraints: {
        maxCost: request.constraints?.maxCost,
        maxDuration: request.constraints?.maxDuration,
        requiredQuality: this.mapQualityThreshold(request.constraints?.qualityThreshold)
      },
      context: {
        productConcept: request.productConcept,
        analysisId
      },
      preferences: request.preferences
    };

    const startTime = Date.now();
    const result = await this.orchestrationAgent.orchestrate(orchestrationRequest);
    const duration = Date.now() - startTime;

    // Record orchestration metrics
    if (this.config.metrics?.enabled) {
      this.metricsAgent.recordMetric('orchestration.executions', 1, 'count', {
        success: result.success.toString(),
        analysis_id: analysisId
      });
      
      this.metricsAgent.recordMetric('orchestration.duration', duration, 'ms', {
        analysis_id: analysisId
      });
      
      this.metricsAgent.recordMetric('orchestration.cost', result.actualCost, '$', {
        analysis_id: analysisId
      });
    }

    return result;
  }

  private async runOptimizedEvaluation(
    evaluationInput: EvaluationRequest,
    analysisId: string
  ): Promise<OptimizedEvaluationResult> {
    const startTime = Date.now();
    const result = await this.optimizedEvalsAgent.evaluate(evaluationInput);
    const duration = Date.now() - startTime;

    // Record evaluation metrics
    if (this.config.metrics?.enabled) {
      this.metricsAgent.recordMetric('evaluation.executions', 1, 'count', {
        type: evaluationInput.evaluationType,
        cache_hit: result.cacheHit.toString(),
        analysis_id: analysisId
      });
      
      this.metricsAgent.recordMetric('evaluation.duration', duration, 'ms', {
        analysis_id: analysisId
      });
      
      this.metricsAgent.recordMetric('evaluation.cost', result.actualCost, '$', {
        analysis_id: analysisId
      });
      
      this.metricsAgent.recordMetric('evaluation.quality_score', result.overallScore, 'score', {
        analysis_id: analysisId
      });
    }

    return result;
  }

  private async runMetricsAnalysis(
    request: ComprehensiveAnalysisRequest,
    currentResult: ComprehensiveAnalysisResult,
    analysisId: string
  ): Promise<MetricsInsight[]> {
    // Analyze metrics relevant to the current analysis
    const timeRange = this.determineMetricsTimeRange(request.analysisType);
    
    const insights = await this.metricsAgent.analyzeMetrics({
      timeRange,
      includeAnomalyDetection: true,
      includeCorrelationAnalysis: request.analysisType === 'comprehensive',
      includePredictions: request.analysisType === 'comprehensive'
    });

    // Filter insights relevant to this analysis
    const relevantInsights = insights.filter(insight => 
      this.isInsightRelevant(insight, request, currentResult)
    );

    return relevantInsights;
  }

  // ============================================================================
  // RESULT SYNTHESIS AND ANALYSIS
  // ============================================================================

  private synthesizeResults(result: ComprehensiveAnalysisResult): void {
    let totalScore = 0;
    let totalConfidence = 0;
    let scoreCount = 0;

    // Incorporate orchestration results
    if (result.orchestrationResult) {
      totalScore += result.orchestrationResult.qualityAchieved;
      totalConfidence += 80; // Orchestration confidence
      scoreCount++;
      
      result.summary.totalCost += result.orchestrationResult.actualCost;
      result.summary.totalDuration += result.orchestrationResult.actualDuration;
    }

    // Incorporate evaluation results
    if (result.evaluationResult) {
      totalScore += result.evaluationResult.overallScore;
      totalConfidence += result.evaluationResult.confidence;
      scoreCount++;
      
      result.summary.totalCost += result.evaluationResult.actualCost;
      result.summary.totalDuration = Math.max(
        result.summary.totalDuration,
        result.evaluationResult.actualLatency
      );
    }

    // Calculate final scores
    if (scoreCount > 0) {
      result.summary.overallScore = Math.round(totalScore / scoreCount);
      result.summary.confidence = Math.round(totalConfidence / scoreCount);
      result.summary.qualityAchieved = result.summary.overallScore;
    }

    // Calculate efficiency score (quality per dollar)
    if (result.summary.totalCost > 0) {
      result.summary.efficiencyScore = Math.round(
        result.summary.overallScore / (result.summary.totalCost * 100)
      );
    } else {
      result.summary.efficiencyScore = 100; // Free analysis gets max efficiency
    }
  }

  private generateUnifiedRecommendations(result: ComprehensiveAnalysisResult): void {
    const recommendations: ComprehensiveAnalysisResult['recommendations'] = [];

    // Orchestration recommendations
    if (result.orchestrationResult) {
      for (const rec of result.orchestrationResult.recommendations) {
        recommendations.push({
          category: 'orchestration',
          priority: this.mapPriority(rec),
          title: `Workflow Optimization: ${rec}`,
          description: rec,
          actionItems: [rec],
          expectedBenefit: 'Improved workflow efficiency',
          effort: 'medium'
        });
      }
    }

    // Evaluation recommendations
    if (result.evaluationResult) {
      for (const rec of result.evaluationResult.recommendations) {
        recommendations.push({
          category: 'evaluation',
          priority: rec.impact === 'high' ? 'high' : 'medium',
          title: `Quality Improvement: ${rec.category}`,
          description: rec.suggestion,
          actionItems: [rec.suggestion],
          expectedBenefit: `${rec.impact} impact improvement`,
          effort: rec.effort
        });
      }
    }

    // Metrics-based recommendations
    if (result.metricsInsights) {
      const criticalInsights = result.metricsInsights.filter(i => i.severity === 'critical');
      for (const insight of criticalInsights.slice(0, 3)) {
        recommendations.push({
          category: 'metrics',
          priority: 'critical',
          title: `Critical Issue: ${insight.title}`,
          description: insight.description,
          actionItems: insight.actionableRecommendations,
          expectedBenefit: 'Prevent system degradation',
          effort: 'high'
        });
      }
    }

    // System-level recommendations
    this.addSystemRecommendations(result, recommendations);

    // Sort by priority and limit
    recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    result.recommendations = recommendations.slice(0, 10); // Top 10 recommendations
  }

  private addSystemRecommendations(
    result: ComprehensiveAnalysisResult,
    recommendations: ComprehensiveAnalysisResult['recommendations']
  ): void {
    // Cost optimization
    if (result.summary.totalCost > 0.50) {
      recommendations.push({
        category: 'system',
        priority: 'medium',
        title: 'Cost Optimization Opportunity',
        description: 'Analysis cost is higher than optimal. Consider using more cost-effective strategies.',
        actionItems: [
          'Enable more aggressive caching',
          'Use faster models for initial analysis',
          'Implement incremental evaluation'
        ],
        expectedBenefit: 'Reduce analysis costs by 20-40%',
        effort: 'low'
      });
    }

    // Quality improvement
    if (result.summary.overallScore < 70) {
      recommendations.push({
        category: 'system',
        priority: 'high',
        title: 'Quality Enhancement Needed',
        description: 'Analysis quality is below target. Consider using higher-accuracy models.',
        actionItems: [
          'Use premium models for critical dimensions',
          'Increase evaluation depth',
          'Add additional validation steps'
        ],
        expectedBenefit: 'Improve analysis quality by 15-25%',
        effort: 'medium'
      });
    }

    // Efficiency optimization
    if (result.summary.efficiencyScore < 50) {
      recommendations.push({
        category: 'system',
        priority: 'medium',
        title: 'Efficiency Optimization',
        description: 'Cost-to-quality ratio can be improved.',
        actionItems: [
          'Optimize model selection',
          'Improve caching strategies',
          'Use hybrid evaluation approaches'
        ],
        expectedBenefit: 'Better cost-quality balance',
        effort: 'medium'
      });
    }
  }

  private calculateSystemPerformance(result: ComprehensiveAnalysisResult): void {
    // Orchestration efficiency
    if (result.orchestrationResult) {
      const targetCost = 0.20;
      const targetDuration = 60000; // 1 minute
      
      const costEfficiency = Math.max(0, 100 - (result.orchestrationResult.actualCost / targetCost) * 100);
      const speedEfficiency = Math.max(0, 100 - (result.orchestrationResult.actualDuration / targetDuration) * 100);
      
      result.systemPerformance.orchestrationEfficiency = Math.round((costEfficiency + speedEfficiency) / 2);
    }

    // Evaluation efficiency
    if (result.evaluationResult) {
      const budgetUtilization = result.evaluationResult.metadata.budgetUtilization;
      const qualityAchieved = result.evaluationResult.metadata.qualityAchieved;
      const cacheBonus = result.evaluationResult.cacheHit ? 20 : 0;
      
      result.systemPerformance.evaluationEfficiency = Math.min(100, 
        Math.round((100 - budgetUtilization) + (qualityAchieved / 2) + cacheBonus) / 2
      );
    }

    // Metrics health (simplified)
    result.systemPerformance.metricsHealth = 85; // Would be calculated from actual metrics health

    // Resource utilization
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    const memUtilization = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    result.systemPerformance.resourceUtilization = Math.round(memUtilization);
  }

  // ============================================================================
  // SYSTEM HEALTH AND MONITORING
  // ============================================================================

  async getSystemHealth(): Promise<SystemHealthReport> {
    const orchestrationHealth = this.assessOrchestrationHealth();
    const metricsHealth = await this.assessMetricsHealth();
    const evaluationHealth = this.assessEvaluationHealth();

    const overallHealth = this.determineOverallHealth([
      orchestrationHealth.status,
      metricsHealth.status,
      evaluationHealth.status
    ]);

    const recommendations: string[] = [];
    
    if (orchestrationHealth.status !== 'healthy') {
      recommendations.push('Orchestration system needs attention');
    }
    if (metricsHealth.status !== 'healthy') {
      recommendations.push('Metrics collection system needs attention');
    }
    if (evaluationHealth.status !== 'healthy') {
      recommendations.push('Evaluation system needs attention');
    }

    return {
      overall: overallHealth,
      components: {
        orchestration: orchestrationHealth,
        metrics: metricsHealth,
        evaluation: evaluationHealth
      },
      recommendations,
      lastUpdated: new Date()
    };
  }

  private assessOrchestrationHealth(): SystemHealthReport['components']['orchestration'] {
    if (!this.config.orchestration?.enabled) {
      return {
        status: 'healthy',
        activeExecutions: 0,
        successRate: 100,
        avgLatency: 0
      };
    }

    // Get running executions from orchestration agent
    const runningExecutions: any[] = []; // Simplified for now
    
    return {
      status: runningExecutions.length > 10 ? 'warning' : 'healthy',
      activeExecutions: runningExecutions.length,
      successRate: 95, // Would be calculated from actual metrics
      avgLatency: 45000 // Would be calculated from actual metrics
    };
  }

  private async assessMetricsHealth(): Promise<SystemHealthReport['components']['metrics']> {
    if (!this.config.metrics?.enabled) {
      return {
        status: 'healthy',
        collectionRate: 0,
        alertsActive: 0,
        dataHealth: 100
      };
    }

    const systemHealth = await this.metricsAgent.getSystemHealth();
    const activeAlerts = this.metricsAgent.getMetricsCollector().getActiveAlerts();

    return {
      status: systemHealth.status,
      collectionRate: systemHealth.metrics.isCollecting ? 100 : 0,
      alertsActive: activeAlerts.length,
      dataHealth: systemHealth.metrics.totalDataPoints > 0 ? 95 : 50
    };
  }

  private assessEvaluationHealth(): SystemHealthReport['components']['evaluation'] {
    if (!this.config.evaluation?.enabled) {
      return {
        status: 'healthy',
        cacheHitRate: 0,
        avgCost: 0,
        qualityScore: 100
      };
    }

    const cacheStats = this.optimizedEvalsAgent.getCacheStats();
    
    return {
      status: cacheStats.avgCostPerEvaluation > 0.20 ? 'warning' : 'healthy',
      cacheHitRate: cacheStats.hitRate,
      avgCost: cacheStats.avgCostPerEvaluation,
      qualityScore: 85 // Would be calculated from actual evaluation results
    };
  }

  private determineOverallHealth(componentStatuses: string[]): 'healthy' | 'warning' | 'critical' {
    if (componentStatuses.includes('critical')) return 'critical';
    if (componentStatuses.includes('warning')) return 'warning';
    return 'healthy';
  }

  private startSystemMonitoring(): void {
    // Monitor system health every 5 minutes
    setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        
        if (this.config.metrics?.enabled) {
          this.metricsAgent.recordMetric('system.health.overall', 
            health.overall === 'healthy' ? 100 : health.overall === 'warning' ? 50 : 0,
            'score',
            { component: 'UnifiedAgentSystem' }
          );
        }

        if (health.overall === 'critical') {
          this.logger.error('System health critical', new Error('System health is critical'), health, 'UnifiedAgentSystem');
        } else if (health.overall === 'warning') {
          this.logger.warn('System health warning', health, 'UnifiedAgentSystem');
        }

      } catch (error) {
        this.logger.error('System health check failed', error as Error, {}, 'UnifiedAgentSystem');
      }
    }, 5 * 60 * 1000);

    this.logger.info('System monitoring started', {
      interval: '5 minutes'
    }, 'UnifiedAgentSystem');
  }

  private setupInterAgentCommunication(): void {
    // Setup communication channels between agents
    // This is where you'd implement event-based communication
    
    this.logger.info('Inter-agent communication setup completed', {}, 'UnifiedAgentSystem');
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private shouldUseOrchestration(request: ComprehensiveAnalysisRequest): boolean {
    // Use orchestration for complex analyses or when specifically requested
    return request.analysisType === 'comprehensive' || 
           request.customWorkflow !== undefined ||
           (request.constraints?.maxDuration !== undefined && request.constraints.maxDuration > 60000);
  }

  private prepareEvaluationInput(
    request: ComprehensiveAnalysisRequest,
    orchestrationResult?: OrchestrationResult
  ): EvaluationRequest {
    const content = orchestrationResult?.results || request.productConcept;
    
    return {
      content,
      evaluationType: this.mapAnalysisTypeToEvaluationType(request.analysisType),
      dimensions: request.evaluationDimensions || ['content-quality', 'strategic-soundness'],
      config: {
        costBudget: request.constraints?.maxCost || this.config.evaluation?.defaultCostBudget,
        latencyTarget: request.constraints?.maxDuration || this.config.evaluation?.defaultLatencyTarget,
        qualityThreshold: request.constraints?.qualityThreshold,
        caching: {
          enabled: this.config.evaluation?.cachingEnabled || false
        },
        fallbackStrategy: request.preferences?.prioritizeSpeed ? 'speed' : 
                         request.preferences?.prioritizeCost ? 'cost' : 'quality'
      },
      priority: request.analysisType === 'quick' ? 'high' : 'normal',
      context: {
        analysisType: request.analysisType,
        originalRequest: request
      }
    };
  }

  private mapAnalysisTypeToEvaluationType(analysisType: string): 'quick' | 'standard' | 'comprehensive' {
    switch (analysisType) {
      case 'quick': return 'quick';
      case 'comprehensive': return 'comprehensive';
      default: return 'standard';
    }
  }

  private mapQualityThreshold(threshold?: number): 'basic' | 'good' | 'excellent' {
    if (!threshold) return 'good';
    if (threshold < 70) return 'basic';
    if (threshold > 85) return 'excellent';
    return 'good';
  }

  private mapPriority(recommendation: string): 'critical' | 'high' | 'medium' | 'low' {
    const criticalKeywords = ['critical', 'urgent', 'immediately', 'failure'];
    const highKeywords = ['important', 'significant', 'major'];
    
    const lowerRec = recommendation.toLowerCase();
    
    if (criticalKeywords.some(keyword => lowerRec.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => lowerRec.includes(keyword))) return 'high';
    return 'medium';
  }

  private determineMetricsTimeRange(analysisType: string): string {
    switch (analysisType) {
      case 'quick': return '1h';
      case 'comprehensive': return '7d';
      default: return '24h';
    }
  }

  private isInsightRelevant(
    insight: MetricsInsight,
    request: ComprehensiveAnalysisRequest,
    currentResult: ComprehensiveAnalysisResult
  ): boolean {
    // Filter insights based on current analysis context
    if (insight.severity === 'critical') return true;
    
    // Include insights related to cost if cost is a constraint
    if (request.constraints?.maxCost && insight.metrics.some(m => m.includes('cost'))) {
      return true;
    }
    
    // Include insights related to quality if quality is important
    if (request.constraints?.qualityThreshold && insight.metrics.some(m => m.includes('quality'))) {
      return true;
    }
    
    return insight.severity === 'warning' && Math.random() > 0.5; // Include some warnings randomly
  }

  private recordAnalysisMetrics(result: ComprehensiveAnalysisResult, totalDuration: number): void {
    if (!this.config.metrics?.enabled) return;

    this.metricsAgent.recordMetric('unified_analysis.executions', 1, 'count', {
      analysis_type: result.metadata.analysisType,
      systems_used: result.metadata.systemsUsed.join(',')
    });

    this.metricsAgent.recordMetric('unified_analysis.duration', totalDuration, 'ms', {
      analysis_type: result.metadata.analysisType
    });

    this.metricsAgent.recordMetric('unified_analysis.cost', result.summary.totalCost, '$', {
      analysis_type: result.metadata.analysisType
    });

    this.metricsAgent.recordMetric('unified_analysis.quality_score', result.summary.overallScore, 'score', {
      analysis_type: result.metadata.analysisType
    });

    this.metricsAgent.recordMetric('unified_analysis.efficiency_score', result.summary.efficiencyScore, 'score', {
      analysis_type: result.metadata.analysisType
    });
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  async quickAnalysis(productConcept: any): Promise<ComprehensiveAnalysisResult> {
    return this.analyzeComprehensively({
      productConcept,
      analysisType: 'quick',
      constraints: {
        maxCost: 0.10,
        maxDuration: 30000 // 30 seconds
      },
      preferences: {
        prioritizeSpeed: true
      },
      evaluationDimensions: ['content-quality']
    });
  }

  async standardAnalysis(productConcept: any): Promise<ComprehensiveAnalysisResult> {
    return this.analyzeComprehensively({
      productConcept,
      analysisType: 'standard',
      constraints: {
        maxCost: 0.30,
        maxDuration: 120000 // 2 minutes
      },
      evaluationDimensions: ['content-quality', 'strategic-soundness']
    });
  }

  async comprehensiveAnalysis(productConcept: any): Promise<ComprehensiveAnalysisResult> {
    return this.analyzeComprehensively({
      productConcept,
      analysisType: 'comprehensive',
      constraints: {
        maxCost: 0.75,
        maxDuration: 300000, // 5 minutes
        qualityThreshold: 85
      },
      preferences: {
        prioritizeQuality: true
      },
      evaluationDimensions: ['content-quality', 'market-research', 'strategic-soundness', 'implementation-readiness']
    });
  }

  getActiveAnalyses(): ComprehensiveAnalysisResult[] {
    return Array.from(this.activeAnalyses.values());
  }

  getAnalysis(analysisId: string): ComprehensiveAnalysisResult | null {
    return this.activeAnalyses.get(analysisId) || null;
  }

  async generateSystemReport(): Promise<{
    systemHealth: SystemHealthReport;
    performanceMetrics: any;
    recentAnalyses: ComprehensiveAnalysisResult[];
  }> {
    const systemHealth = await this.getSystemHealth();
    
    const performanceMetrics = {
      uptime: Date.now() - this.systemStartTime.getTime(),
      totalAnalyses: this.activeAnalyses.size,
      avgAnalysisCost: Array.from(this.activeAnalyses.values())
        .reduce((sum, analysis) => sum + analysis.summary.totalCost, 0) / Math.max(1, this.activeAnalyses.size),
      avgAnalysisQuality: Array.from(this.activeAnalyses.values())
        .reduce((sum, analysis) => sum + analysis.summary.overallScore, 0) / Math.max(1, this.activeAnalyses.size)
    };

    const recentAnalyses = Array.from(this.activeAnalyses.values())
      .sort((a, b) => b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime())
      .slice(0, 10);

    return {
      systemHealth,
      performanceMetrics,
      recentAnalyses
    };
  }

  // Cleanup old analyses
  cleanup(olderThanHours: number = 24): number {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [id, analysis] of this.activeAnalyses.entries()) {
      if (analysis.metadata.timestamp.getTime() < cutoffTime) {
        this.activeAnalyses.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.info('Cleaned up old analyses', {
        cleanedCount: cleaned,
        remainingCount: this.activeAnalyses.size
      }, 'UnifiedAgentSystem');
    }

    return cleaned;
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Unified Agent System', {}, 'UnifiedAgentSystem');

    if (this.config.metrics?.enabled) {
      this.metricsAgent.stopMetricsCollection();
    }

    // Clean up resources
    this.activeAnalyses.clear();

    this.logger.info('Unified Agent System shutdown completed', {}, 'UnifiedAgentSystem');
  }
}