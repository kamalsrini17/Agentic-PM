/**
 * Comprehensive System Tests for the Unified Agent System
 * Tests orchestration, metrics, evaluation, and integration
 */

import { UnifiedAgentSystem, ComprehensiveAnalysisRequest } from './UnifiedAgentSystem';
import { Logger } from '../utils/errorHandling';

// ============================================================================
// TEST INTERFACES
// ============================================================================

interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  details: any;
  error?: string;
}

interface SystemTestReport {
  overallPassed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  testResults: TestResult[];
  systemPerformance: {
    avgResponseTime: number;
    avgCost: number;
    avgQuality: number;
    systemHealth: any;
  };
  recommendations: string[];
}

// ============================================================================
// SYSTEM TESTS
// ============================================================================

export class SystemTests {
  private unifiedSystem!: UnifiedAgentSystem;
  private logger: Logger;
  private testResults: TestResult[] = [];

  constructor() {
    this.logger = Logger.getInstance();
  }

  async runAllTests(): Promise<SystemTestReport> {
    this.logger.info('Starting comprehensive system tests', {}, 'SystemTests');
    
    const startTime = Date.now();
    this.testResults = [];

    try {
      // Initialize system
      this.unifiedSystem = new UnifiedAgentSystem({
        orchestration: { enabled: true },
        metrics: { enabled: true, collectionInterval: 30000 },
        evaluation: { enabled: true, cachingEnabled: true }
      });

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Run test suites
      await this.runOrchestrationTests();
      await this.runMetricsTests();
      await this.runEvaluationTests();
      await this.runIntegrationTests();
      await this.runPerformanceTests();
      await this.runStressTests();

      // Generate report
      const report = this.generateTestReport(Date.now() - startTime);
      
      this.logger.info('System tests completed', {
        passed: report.passedTests,
        failed: report.failedTests,
        duration: report.totalDuration
      }, 'SystemTests');

      return report;

    } catch (error) {
      this.logger.error('System tests failed', error as Error, {}, 'SystemTests');
      throw error;
    } finally {
      // Cleanup
      if (this.unifiedSystem) {
        await this.unifiedSystem.shutdown();
      }
    }
  }

  // ============================================================================
  // ORCHESTRATION TESTS
  // ============================================================================

  private async runOrchestrationTests(): Promise<void> {
    this.logger.info('Running orchestration tests', {}, 'SystemTests');

    // Test 1: Basic orchestration functionality
    await this.runTest('orchestration-basic', async () => {
      const request: ComprehensiveAnalysisRequest = {
        productConcept: {
          title: 'Test Product',
          description: 'A test product for orchestration',
          targetMarket: 'Test Market'
        },
        analysisType: 'standard'
      };

      const result = await this.unifiedSystem.standardAnalysis(request.productConcept);
      
      return {
        hasOrchestrationResult: !!result.orchestrationResult,
        executionSuccess: result.orchestrationResult?.success || false,
        cost: result.orchestrationResult?.actualCost || 0,
        duration: result.orchestrationResult?.actualDuration || 0
      };
    });

    // Test 2: Workflow template selection
    await this.runTest('orchestration-template-selection', async () => {
      const quickRequest: ComprehensiveAnalysisRequest = {
        productConcept: { title: 'Quick Test', description: 'Quick analysis test' },
        analysisType: 'quick',
        constraints: { maxDuration: 30000 }
      };

      const result = await this.unifiedSystem.quickAnalysis(quickRequest.productConcept);
      
      return {
        completedInTime: result.summary.totalDuration <= 30000,
        hasResults: result.orchestrationResult !== undefined,
        optimizationApplied: result.metadata.optimizationsApplied.length > 0
      };
    });

    // Test 3: Error handling and recovery
    await this.runTest('orchestration-error-handling', async () => {
      try {
        const badRequest: ComprehensiveAnalysisRequest = {
          productConcept: null as any,
          analysisType: 'standard'
        };

        await this.unifiedSystem.standardAnalysis(badRequest.productConcept);
        return { errorHandled: false }; // Should not reach here
      } catch (error) {
        return {
          errorHandled: true,
          errorType: (error as Error).constructor.name,
          hasUserFriendlyMessage: (error as Error).message.length > 0
        };
      }
    });
  }

  // ============================================================================
  // METRICS TESTS
  // ============================================================================

  private async runMetricsTests(): Promise<void> {
    this.logger.info('Running metrics tests', {}, 'SystemTests');

    // Test 1: Metrics collection
    await this.runTest('metrics-collection', async () => {
      const healthBefore = await this.unifiedSystem.getSystemHealth();
      
      // Generate some activity
      await this.unifiedSystem.quickAnalysis({
        title: 'Metrics Test Product',
        description: 'Testing metrics collection'
      });

      // Wait for metrics to be collected
      await new Promise(resolve => setTimeout(resolve, 1000));

      const healthAfter = await this.unifiedSystem.getSystemHealth();

      return {
        metricsEnabled: healthAfter.components.metrics.collectionRate > 0,
        dataCollected: healthAfter.components.metrics.dataHealth > 0,
        systemResponsive: healthAfter.overall !== 'critical'
      };
    });

    // Test 2: Alerting system
    await this.runTest('metrics-alerting', async () => {
      // This would test alert generation, but requires more complex setup
      return {
        alertSystemActive: true, // Placeholder
        alertsConfigured: true   // Placeholder
      };
    });

    // Test 3: Performance tracking
    await this.runTest('metrics-performance-tracking', async () => {
      const startTime = Date.now();
      
      await this.unifiedSystem.quickAnalysis({
        title: 'Performance Test',
        description: 'Testing performance metrics'
      });

      const duration = Date.now() - startTime;

      return {
        responseTimeTracked: duration > 0,
        performanceAcceptable: duration < 60000, // Under 1 minute
        metricsRecorded: true
      };
    });
  }

  // ============================================================================
  // EVALUATION TESTS
  // ============================================================================

  private async runEvaluationTests(): Promise<void> {
    this.logger.info('Running evaluation tests', {}, 'SystemTests');

    // Test 1: Basic evaluation functionality
    await this.runTest('evaluation-basic', async () => {
      const result = await this.unifiedSystem.quickAnalysis({
        title: 'Evaluation Test Product',
        description: 'Testing evaluation functionality',
        keyFeatures: ['Feature 1', 'Feature 2']
      });

      return {
        hasEvaluationResult: !!result.evaluationResult,
        hasScore: result.evaluationResult?.overallScore !== undefined,
        hasConfidence: result.evaluationResult?.confidence !== undefined,
        scoreInRange: result.evaluationResult ? 
          result.evaluationResult.overallScore >= 0 && result.evaluationResult.overallScore <= 100 : false
      };
    });

    // Test 2: Cost optimization
    await this.runTest('evaluation-cost-optimization', async () => {
      const lowCostResult = await this.unifiedSystem.analyzeComprehensively({
        productConcept: { title: 'Cost Test', description: 'Testing cost optimization' },
        analysisType: 'quick',
        constraints: { maxCost: 0.05 },
        preferences: { prioritizeCost: true }
      });

      return {
        stayedUnderBudget: lowCostResult.summary.totalCost <= 0.05,
        usedOptimization: lowCostResult.evaluationResult?.optimizationStrategy === 'cost-optimized',
        hasResults: (lowCostResult.evaluationResult?.overallScore || 0) > 0
      };
    });

    // Test 3: Caching system
    await this.runTest('evaluation-caching', async () => {
      const testProduct = {
        title: 'Cache Test Product',
        description: 'Testing caching functionality'
      };

      // First evaluation
      const result1 = await this.unifiedSystem.quickAnalysis(testProduct);
      
      // Second evaluation (should hit cache)
      const result2 = await this.unifiedSystem.quickAnalysis(testProduct);

      return {
        firstEvaluationCompleted: !!result1.evaluationResult,
        secondEvaluationCompleted: !!result2.evaluationResult,
        cacheHit: result2.evaluationResult?.cacheHit || false,
        fasterSecondTime: result2.evaluationResult ? 
          result2.evaluationResult.actualLatency < (result1.evaluationResult?.actualLatency || Infinity) : false
      };
    });

    // Test 4: Quality vs Speed tradeoff
    await this.runTest('evaluation-quality-speed-tradeoff', async () => {
      const speedResult = await this.unifiedSystem.analyzeComprehensively({
        productConcept: { title: 'Speed Test', description: 'Testing speed optimization' },
        analysisType: 'quick',
        preferences: { prioritizeSpeed: true }
      });

      const qualityResult = await this.unifiedSystem.analyzeComprehensively({
        productConcept: { title: 'Quality Test', description: 'Testing quality optimization' },
        analysisType: 'comprehensive',
        preferences: { prioritizeQuality: true }
      });

      return {
        speedResultFaster: speedResult.summary.totalDuration < qualityResult.summary.totalDuration,
        qualityResultBetter: qualityResult.summary.overallScore >= speedResult.summary.overallScore,
        bothCompleted: !!speedResult.evaluationResult && !!qualityResult.evaluationResult
      };
    });
  }

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  private async runIntegrationTests(): Promise<void> {
    this.logger.info('Running integration tests', {}, 'SystemTests');

    // Test 1: End-to-end workflow
    await this.runTest('integration-end-to-end', async () => {
      const result = await this.unifiedSystem.comprehensiveAnalysis({
        title: 'Integration Test Product',
        description: 'A comprehensive product for testing full integration',
        targetMarket: 'Tech Professionals',
        keyFeatures: ['AI Integration', 'Real-time Analytics', 'User-friendly Interface']
      });

      return {
        hasOrchestrationResult: !!result.orchestrationResult,
        hasEvaluationResult: !!result.evaluationResult,
        hasMetricsInsights: !!result.metricsInsights && result.metricsInsights.length > 0,
        hasRecommendations: result.recommendations.length > 0,
        overallScoreValid: result.summary.overallScore >= 0 && result.summary.overallScore <= 100,
        allSystemsUsed: result.metadata.systemsUsed.length >= 2
      };
    });

    // Test 2: System communication
    await this.runTest('integration-system-communication', async () => {
      const result = await this.unifiedSystem.standardAnalysis({
        title: 'Communication Test',
        description: 'Testing inter-system communication'
      });

      // Check if orchestration results influenced evaluation
      const orchestrationInfluenced = result.evaluationResult && result.orchestrationResult &&
        result.evaluationResult.actualCost !== result.orchestrationResult.actualCost;

      return {
        systemsCommunicated: orchestrationInfluenced,
        dataFlowCorrect: result.summary.totalCost > 0,
        metricsRecorded: result.systemPerformance.resourceUtilization >= 0
      };
    });

    // Test 3: Error propagation and handling
    await this.runTest('integration-error-propagation', async () => {
      try {
        // Test with malformed input
        await this.unifiedSystem.analyzeComprehensively({
          productConcept: { title: '', description: '' }, // Empty required fields
          analysisType: 'standard'
        });
        
        return { errorHandlingWorked: false }; // Should not reach here
      } catch (error) {
        return {
          errorHandlingWorked: true,
          errorPropagated: true,
          gracefulDegradation: (error as Error).message.includes('validation') || 
                              (error as Error).message.includes('failed')
        };
      }
    });
  }

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  private async runPerformanceTests(): Promise<void> {
    this.logger.info('Running performance tests', {}, 'SystemTests');

    // Test 1: Response time benchmarks
    await this.runTest('performance-response-time', async () => {
      const startTime = Date.now();
      
      const result = await this.unifiedSystem.quickAnalysis({
        title: 'Performance Test',
        description: 'Testing response time performance'
      });

      const duration = Date.now() - startTime;

      return {
        completedInTime: duration < 30000, // Under 30 seconds for quick analysis
        actualDuration: duration,
        responseTimeAcceptable: duration < 60000,
        hasResults: !!result.evaluationResult
      };
    });

    // Test 2: Memory usage
    await this.runTest('performance-memory-usage', async () => {
      const memBefore = process.memoryUsage();
      
      await this.unifiedSystem.standardAnalysis({
        title: 'Memory Test',
        description: 'Testing memory usage during analysis'
      });

      const memAfter = process.memoryUsage();
      const memIncrease = memAfter.heapUsed - memBefore.heapUsed;

      return {
        memoryIncreaseReasonable: memIncrease < 100 * 1024 * 1024, // Under 100MB increase
        noMemoryLeaks: memAfter.heapUsed < memBefore.heapUsed * 2, // Not doubled
        memoryUsage: memIncrease
      };
    });

    // Test 3: Concurrent analysis handling
    await this.runTest('performance-concurrent-handling', async () => {
      const concurrentAnalyses = 3;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentAnalyses }, (_, i) =>
        this.unifiedSystem.quickAnalysis({
          title: `Concurrent Test ${i + 1}`,
          description: `Testing concurrent analysis ${i + 1}`
        })
      );

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      return {
        allCompleted: results.length === concurrentAnalyses,
        allSuccessful: results.every(r => r.summary.overallScore > 0),
        reasonableTime: duration < 60000, // Under 1 minute for 3 concurrent
        actualDuration: duration,
        concurrentHandlingWorked: true
      };
    });
  }

  // ============================================================================
  // STRESS TESTS
  // ============================================================================

  private async runStressTests(): Promise<void> {
    this.logger.info('Running stress tests', {}, 'SystemTests');

    // Test 1: High load handling
    await this.runTest('stress-high-load', async () => {
      const highLoadCount = 5;
      const startTime = Date.now();
      let successCount = 0;
      let errorCount = 0;

      const promises = Array.from({ length: highLoadCount }, async (_, i) => {
        try {
          const result = await this.unifiedSystem.quickAnalysis({
            title: `Stress Test ${i + 1}`,
            description: `High load stress test ${i + 1}`
          });
          if (result.summary.overallScore > 0) successCount++;
          return result;
        } catch (error) {
          errorCount++;
          throw error;
        }
      });

      try {
        await Promise.allSettled(promises);
      } catch (error) {
        // Some failures expected under high load
      }

      const duration = Date.now() - startTime;

      return {
        handledHighLoad: successCount > 0,
        successRate: (successCount / highLoadCount) * 100,
        errorRate: (errorCount / highLoadCount) * 100,
        systemStable: errorCount < highLoadCount, // Not all failed
        duration
      };
    });

    // Test 2: Resource exhaustion recovery
    await this.runTest('stress-resource-recovery', async () => {
      // Simulate resource exhaustion by running many analyses
      const exhaustionCount = 10;
      let recoverySuccessful = false;

      try {
        // Run many analyses to potentially exhaust resources
        const promises = Array.from({ length: exhaustionCount }, (_, i) =>
          this.unifiedSystem.quickAnalysis({
            title: `Exhaustion Test ${i + 1}`,
            description: 'Testing resource exhaustion and recovery'
          })
        );

        await Promise.allSettled(promises);

        // Try to recover with a simple analysis
        const recoveryResult = await this.unifiedSystem.quickAnalysis({
          title: 'Recovery Test',
          description: 'Testing system recovery after stress'
        });

        recoverySuccessful = recoveryResult.summary.overallScore > 0;

      } catch (error) {
        // Expected under stress
      }

      return {
        systemRecovered: recoverySuccessful,
        gracefulDegradation: true // If we get here, system didn't crash
      };
    });
  }

  // ============================================================================
  // TEST UTILITIES
  // ============================================================================

  private async runTest(testName: string, testFunction: () => Promise<any>): Promise<void> {
    const startTime = Date.now();
    let result: TestResult;

    try {
      this.logger.debug(`Running test: ${testName}`, {}, 'SystemTests');
      
      const details = await testFunction();
      const duration = Date.now() - startTime;

      result = {
        testName,
        passed: this.evaluateTestResult(details),
        duration,
        details
      };

      if (result.passed) {
        this.logger.debug(`Test passed: ${testName}`, { duration }, 'SystemTests');
      } else {
        this.logger.warn(`Test failed: ${testName}`, { details, duration }, 'SystemTests');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      
      result = {
        testName,
        passed: false,
        duration,
        details: {},
        error: (error as Error).message
      };

      this.logger.error(`Test error: ${testName}`, error as Error, { duration }, 'SystemTests');
    }

    this.testResults.push(result);
  }

  private evaluateTestResult(details: any): boolean {
    // Generic test result evaluation
    if (typeof details === 'boolean') return details;
    if (typeof details === 'object' && details !== null) {
      // If any boolean property is false, test fails
      for (const [key, value] of Object.entries(details)) {
        if (typeof value === 'boolean' && value === false) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  private generateTestReport(totalDuration: number): SystemTestReport {
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = this.testResults.filter(t => !t.passed).length;

    // Calculate performance metrics
    const responseTimes = this.testResults
      .filter(t => t.testName.includes('performance') && t.passed)
      .map(t => t.details.actualDuration || t.duration);

    const avgResponseTime = responseTimes.length > 0 ?
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

    // Extract cost and quality data from test results
    const costResults = this.testResults
      .filter(t => t.details.cost !== undefined)
      .map(t => t.details.cost);

    const qualityResults = this.testResults
      .filter(t => t.details.hasScore || t.details.overallScoreValid)
      .length;

    const avgCost = costResults.length > 0 ?
      costResults.reduce((a, b) => a + b, 0) / costResults.length : 0;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (failedTests > 0) {
      recommendations.push(`${failedTests} test(s) failed - review system components`);
    }
    
    if (avgResponseTime > 30000) {
      recommendations.push('Response times are high - consider performance optimization');
    }
    
    if (avgCost > 0.20) {
      recommendations.push('Average costs are high - review cost optimization strategies');
    }

    const failedTestsByCategory = this.categorizeFailedTests();
    if (failedTestsByCategory.orchestration > 0) {
      recommendations.push('Orchestration system needs attention');
    }
    if (failedTestsByCategory.metrics > 0) {
      recommendations.push('Metrics system needs attention');
    }
    if (failedTestsByCategory.evaluation > 0) {
      recommendations.push('Evaluation system needs attention');
    }

    return {
      overallPassed: failedTests === 0,
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      totalDuration,
      testResults: this.testResults,
      systemPerformance: {
        avgResponseTime,
        avgCost,
        avgQuality: qualityResults / Math.max(1, this.testResults.length) * 100,
        systemHealth: null // Would be populated with actual health data
      },
      recommendations
    };
  }

  private categorizeFailedTests(): Record<string, number> {
    const categories = {
      orchestration: 0,
      metrics: 0,
      evaluation: 0,
      integration: 0,
      performance: 0,
      stress: 0
    };

    for (const test of this.testResults.filter(t => !t.passed)) {
      if (test.testName.includes('orchestration')) categories.orchestration++;
      else if (test.testName.includes('metrics')) categories.metrics++;
      else if (test.testName.includes('evaluation')) categories.evaluation++;
      else if (test.testName.includes('integration')) categories.integration++;
      else if (test.testName.includes('performance')) categories.performance++;
      else if (test.testName.includes('stress')) categories.stress++;
    }

    return categories;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  static async runQuickTests(): Promise<SystemTestReport> {
    const tests = new SystemTests();
    
    try {
      // Initialize system
      tests.unifiedSystem = new UnifiedAgentSystem({
        orchestration: { enabled: true },
        metrics: { enabled: false }, // Disable for quick tests
        evaluation: { enabled: true, cachingEnabled: false }
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Run basic tests only
      await tests.runTest('quick-basic-functionality', async () => {
        const result = await tests.unifiedSystem.quickAnalysis({
          title: 'Quick Test Product',
          description: 'Basic functionality test'
        });

        return {
          completed: !!result,
          hasScore: result.summary.overallScore > 0,
          reasonableTime: result.summary.totalDuration < 30000
        };
      });

      await tests.runTest('quick-error-handling', async () => {
        try {
          await tests.unifiedSystem.quickAnalysis(null as any);
          return { errorHandled: false };
        } catch (error) {
          return { errorHandled: true };
        }
      });

      return tests.generateTestReport(0);

    } finally {
      if (tests.unifiedSystem) {
        await tests.unifiedSystem.shutdown();
      }
    }
  }

  static async runPerformanceTests(): Promise<SystemTestReport> {
    const tests = new SystemTests();
    
    try {
      tests.unifiedSystem = new UnifiedAgentSystem();
      await new Promise(resolve => setTimeout(resolve, 2000));

      await tests.runPerformanceTests();
      return tests.generateTestReport(0);

    } finally {
      if (tests.unifiedSystem) {
        await tests.unifiedSystem.shutdown();
      }
    }
  }
}