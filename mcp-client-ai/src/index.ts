/**
 * Enhanced Agentic PM - Main Entry Point
 * Unified Agent System with Orchestration, Metrics, and Optimized Evaluation
 */

// Core System
export { UnifiedAgentSystem } from './integration/UnifiedAgentSystem';
export type { 
  ComprehensiveAnalysisRequest, 
  ComprehensiveAnalysisResult,
  SystemHealthReport,
  UnifiedSystemConfig 
} from './integration/UnifiedAgentSystem';

// Orchestration Framework
export { WorkflowEngine } from './orchestration/WorkflowEngine';
export { OrchestrationAgent } from './orchestration/OrchestrationAgent';
export type {
  WorkflowDefinition,
  WorkflowExecution,
  AgentCapability
} from './orchestration/WorkflowEngine';
export type {
  OrchestrationRequest,
  OrchestrationResult
} from './orchestration/OrchestrationAgent';

// Metrics Infrastructure
export { MetricsCollector, BUSINESS_METRICS } from './metrics/MetricsCollector';
export { MetricsAgent } from './metrics/MetricsAgent';
export type {
  MetricDataPoint,
  MetricAlert,
  Dashboard
} from './metrics/MetricsCollector';
export type {
  MetricsInsight,
  MetricsReport
} from './metrics/MetricsAgent';

// Optimized Evaluation
export { OptimizedEvalsAgent } from './evaluation/OptimizedEvalsAgent';
export type {
  EvaluationConfig,
  EvaluationRequest,
  OptimizedEvaluationResult,
  ModelPerformanceProfile
} from './evaluation/OptimizedEvalsAgent';

// Legacy Exports (for backward compatibility)
// export { AgenticPMClient } from './agenticClient'; // Temporarily disabled due to compilation issues
export { AgenticPMOrchestrator } from './agents/AgenticPMOrchestrator';
export { EvaluationAgent } from './agents/EvaluationAgent';
export { AgenticPMEvaluationFramework } from './evaluation/MetricsFramework';

// Utilities
export { Logger, AgenticError, ErrorCode } from './utils/errorHandling';
export { MultiModelAI } from './services/MultiModelAI';

// Testing
export { SystemTests } from './integration/SystemTests';

// ============================================================================
// QUICK START INTERFACE
// ============================================================================

import { UnifiedAgentSystem } from './integration/UnifiedAgentSystem';

/**
 * Quick Start - Create and configure a unified agent system
 */
export class AgenticPM {
  private system: UnifiedAgentSystem;

  constructor(config?: {
    enableOrchestration?: boolean;
    enableMetrics?: boolean;
    enableEvaluation?: boolean;
    costBudget?: number;
    latencyTarget?: number;
  }) {
    this.system = new UnifiedAgentSystem({
      orchestration: { enabled: config?.enableOrchestration ?? true },
      metrics: { 
        enabled: config?.enableMetrics ?? true,
        collectionInterval: 60000,
        autoReporting: true
      },
      evaluation: { 
        enabled: config?.enableEvaluation ?? true,
        defaultCostBudget: config?.costBudget ?? 0.50,
        defaultLatencyTarget: config?.latencyTarget ?? 30000,
        cachingEnabled: true
      }
    });
  }

  /**
   * Quick analysis - Fast, cost-effective analysis
   */
  async quickAnalysis(productConcept: {
    title: string;
    description: string;
    targetMarket?: string;
    keyFeatures?: string[];
  }) {
    return await this.system.quickAnalysis(productConcept);
  }

  /**
   * Standard analysis - Balanced analysis with good depth
   */
  async standardAnalysis(productConcept: {
    title: string;
    description: string;
    targetMarket?: string;
    keyFeatures?: string[];
    goals?: string[];
  }) {
    return await this.system.standardAnalysis(productConcept);
  }

  /**
   * Comprehensive analysis - Deep, high-quality analysis
   */
  async comprehensiveAnalysis(productConcept: {
    title: string;
    description: string;
    targetMarket: string;
    keyFeatures: string[];
    goals?: string[];
    constraints?: string[];
    timeline?: string;
  }) {
    return await this.system.comprehensiveAnalysis(productConcept);
  }

  /**
   * Get system health and performance metrics
   */
  async getSystemHealth() {
    return await this.system.getSystemHealth();
  }

  /**
   * Generate comprehensive system report
   */
  async generateReport() {
    return await this.system.generateSystemReport();
  }

  /**
   * Get active analyses
   */
  getActiveAnalyses() {
    return this.system.getActiveAnalyses();
  }

  /**
   * Get specific analysis by ID
   */
  getAnalysis(analysisId: string) {
    return this.system.getAnalysis(analysisId);
  }

  /**
   * Cleanup old analyses and optimize performance
   */
  cleanup(olderThanHours: number = 24) {
    return this.system.cleanup(olderThanHours);
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    await this.system.shutdown();
  }
}

// ============================================================================
// CONFIGURATION PRESETS
// ============================================================================

export const AgenticPMPresets = {
  /**
   * Speed-optimized configuration
   */
  speed: {
    enableOrchestration: false, // Skip orchestration for speed
    enableMetrics: false,       // Minimal metrics
    enableEvaluation: true,
    costBudget: 0.10,
    latencyTarget: 15000        // 15 seconds
  },

  /**
   * Cost-optimized configuration
   */
  cost: {
    enableOrchestration: true,
    enableMetrics: true,
    enableEvaluation: true,
    costBudget: 0.20,           // Low cost budget
    latencyTarget: 60000        // Allow more time for cost optimization
  },

  /**
   * Quality-optimized configuration
   */
  quality: {
    enableOrchestration: true,
    enableMetrics: true,
    enableEvaluation: true,
    costBudget: 1.00,           // Higher budget for quality
    latencyTarget: 120000       // Allow more time for thorough analysis
  },

  /**
   * Development/testing configuration
   */
  development: {
    enableOrchestration: true,
    enableMetrics: true,
    enableEvaluation: true,
    costBudget: 0.50,
    latencyTarget: 45000
  },

  /**
   * Production configuration
   */
  production: {
    enableOrchestration: true,
    enableMetrics: true,
    enableEvaluation: true,
    costBudget: 0.75,
    latencyTarget: 30000
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Run system tests
 */
export async function runSystemTests(testType: 'quick' | 'full' | 'performance' = 'quick') {
  const { SystemTests } = await import('./integration/SystemTests');
  
  switch (testType) {
    case 'quick':
      return await SystemTests.runQuickTests();
    case 'performance':
      return await SystemTests.runPerformanceTests();
    case 'full':
    default:
      const tests = new SystemTests();
      return await tests.runAllTests();
  }
}

/**
 * Create AgenticPM instance with preset configuration
 */
export function createAgenticPM(preset: keyof typeof AgenticPMPresets = 'development') {
  return new AgenticPM(AgenticPMPresets[preset]);
}

// ============================================================================
// EXAMPLES AND USAGE
// ============================================================================

export const examples = {
  /**
   * Basic usage example
   */
  async basicUsage() {
    const agentic = new AgenticPM();
    
    const result = await agentic.quickAnalysis({
      title: "AI-Powered Task Manager",
      description: "An intelligent task management system with AI prioritization",
      targetMarket: "Remote teams and freelancers",
      keyFeatures: ["AI Prioritization", "Team Collaboration", "Analytics Dashboard"]
    });
    
    console.log('Analysis Result:', result.summary);
    console.log('Recommendations:', result.recommendations);
    
    await agentic.shutdown();
  },

  /**
   * Advanced usage with custom configuration
   */
  async advancedUsage() {
    const agentic = new AgenticPM({
      enableOrchestration: true,
      enableMetrics: true,
      enableEvaluation: true,
      costBudget: 0.30,
      latencyTarget: 45000
    });

    const result = await agentic.comprehensiveAnalysis({
      title: "Enterprise CRM Platform",
      description: "A comprehensive customer relationship management platform for large enterprises",
      targetMarket: "Enterprise companies with 1000+ employees",
      keyFeatures: [
        "Advanced Analytics",
        "AI-Powered Insights",
        "Integration Hub",
        "Mobile App",
        "Custom Workflows"
      ],
      goals: [
        "Increase sales efficiency by 30%",
        "Improve customer satisfaction scores",
        "Reduce data entry time by 50%"
      ],
      constraints: [
        "Must integrate with existing systems",
        "GDPR compliance required",
        "Budget limit of $2M"
      ]
    });

    console.log('Comprehensive Analysis:', result);
    
    // Get system health
    const health = await agentic.getSystemHealth();
    console.log('System Health:', health);
    
    await agentic.shutdown();
  },

  /**
   * Batch processing example
   */
  async batchProcessing() {
    const agentic = createAgenticPM('production');
    
    const products = [
      { title: "Product A", description: "Description A" },
      { title: "Product B", description: "Description B" },
      { title: "Product C", description: "Description C" }
    ];

    const results = await Promise.all(
      products.map(product => agentic.quickAnalysis(product))
    );

    console.log('Batch Results:', results.map(r => ({
      title: r.analysisId,
      score: r.summary.overallScore,
      cost: r.summary.totalCost
    })));

    await agentic.shutdown();
  }
};

// Default export for convenience
export default AgenticPM;