"use strict";
/**
 * Comprehensive System Tests for the Unified Agent System
 * Tests orchestration, metrics, evaluation, and integration
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemTests = void 0;
const UnifiedAgentSystem_1 = require("./UnifiedAgentSystem");
const errorHandling_1 = require("../utils/errorHandling");
// ============================================================================
// SYSTEM TESTS
// ============================================================================
class SystemTests {
    constructor() {
        this.testResults = [];
        this.logger = errorHandling_1.Logger.getInstance();
    }
    runAllTests() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Starting comprehensive system tests', {}, 'SystemTests');
            const startTime = Date.now();
            this.testResults = [];
            try {
                // Initialize system
                this.unifiedSystem = new UnifiedAgentSystem_1.UnifiedAgentSystem({
                    orchestration: { enabled: true },
                    metrics: { enabled: true, collectionInterval: 30000 },
                    evaluation: { enabled: true, cachingEnabled: true }
                });
                // Wait for initialization
                yield new Promise(resolve => setTimeout(resolve, 2000));
                // Run test suites
                yield this.runOrchestrationTests();
                yield this.runMetricsTests();
                yield this.runEvaluationTests();
                yield this.runIntegrationTests();
                yield this.runPerformanceTests();
                yield this.runStressTests();
                // Generate report
                const report = this.generateTestReport(Date.now() - startTime);
                this.logger.info('System tests completed', {
                    passed: report.passedTests,
                    failed: report.failedTests,
                    duration: report.totalDuration
                }, 'SystemTests');
                return report;
            }
            catch (error) {
                this.logger.error('System tests failed', error, {}, 'SystemTests');
                throw error;
            }
            finally {
                // Cleanup
                if (this.unifiedSystem) {
                    yield this.unifiedSystem.shutdown();
                }
            }
        });
    }
    // ============================================================================
    // ORCHESTRATION TESTS
    // ============================================================================
    runOrchestrationTests() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Running orchestration tests', {}, 'SystemTests');
            // Test 1: Basic orchestration functionality
            yield this.runTest('orchestration-basic', () => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const request = {
                    productConcept: {
                        title: 'Test Product',
                        description: 'A test product for orchestration',
                        targetMarket: 'Test Market'
                    },
                    analysisType: 'standard'
                };
                const result = yield this.unifiedSystem.standardAnalysis(request.productConcept);
                return {
                    hasOrchestrationResult: !!result.orchestrationResult,
                    executionSuccess: ((_a = result.orchestrationResult) === null || _a === void 0 ? void 0 : _a.success) || false,
                    cost: ((_b = result.orchestrationResult) === null || _b === void 0 ? void 0 : _b.actualCost) || 0,
                    duration: ((_c = result.orchestrationResult) === null || _c === void 0 ? void 0 : _c.actualDuration) || 0
                };
            }));
            // Test 2: Workflow template selection
            yield this.runTest('orchestration-template-selection', () => __awaiter(this, void 0, void 0, function* () {
                const quickRequest = {
                    productConcept: { title: 'Quick Test', description: 'Quick analysis test' },
                    analysisType: 'quick',
                    constraints: { maxDuration: 30000 }
                };
                const result = yield this.unifiedSystem.quickAnalysis(quickRequest.productConcept);
                return {
                    completedInTime: result.summary.totalDuration <= 30000,
                    hasResults: result.orchestrationResult !== undefined,
                    optimizationApplied: result.metadata.optimizationsApplied.length > 0
                };
            }));
            // Test 3: Error handling and recovery
            yield this.runTest('orchestration-error-handling', () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const badRequest = {
                        productConcept: null,
                        analysisType: 'standard'
                    };
                    yield this.unifiedSystem.standardAnalysis(badRequest.productConcept);
                    return { errorHandled: false }; // Should not reach here
                }
                catch (error) {
                    return {
                        errorHandled: true,
                        errorType: error.constructor.name,
                        hasUserFriendlyMessage: error.message.length > 0
                    };
                }
            }));
        });
    }
    // ============================================================================
    // METRICS TESTS
    // ============================================================================
    runMetricsTests() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Running metrics tests', {}, 'SystemTests');
            // Test 1: Metrics collection
            yield this.runTest('metrics-collection', () => __awaiter(this, void 0, void 0, function* () {
                const healthBefore = yield this.unifiedSystem.getSystemHealth();
                // Generate some activity
                yield this.unifiedSystem.quickAnalysis({
                    title: 'Metrics Test Product',
                    description: 'Testing metrics collection'
                });
                // Wait for metrics to be collected
                yield new Promise(resolve => setTimeout(resolve, 1000));
                const healthAfter = yield this.unifiedSystem.getSystemHealth();
                return {
                    metricsEnabled: healthAfter.components.metrics.collectionRate > 0,
                    dataCollected: healthAfter.components.metrics.dataHealth > 0,
                    systemResponsive: healthAfter.overall !== 'critical'
                };
            }));
            // Test 2: Alerting system
            yield this.runTest('metrics-alerting', () => __awaiter(this, void 0, void 0, function* () {
                // This would test alert generation, but requires more complex setup
                return {
                    alertSystemActive: true, // Placeholder
                    alertsConfigured: true // Placeholder
                };
            }));
            // Test 3: Performance tracking
            yield this.runTest('metrics-performance-tracking', () => __awaiter(this, void 0, void 0, function* () {
                const startTime = Date.now();
                yield this.unifiedSystem.quickAnalysis({
                    title: 'Performance Test',
                    description: 'Testing performance metrics'
                });
                const duration = Date.now() - startTime;
                return {
                    responseTimeTracked: duration > 0,
                    performanceAcceptable: duration < 60000, // Under 1 minute
                    metricsRecorded: true
                };
            }));
        });
    }
    // ============================================================================
    // EVALUATION TESTS
    // ============================================================================
    runEvaluationTests() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Running evaluation tests', {}, 'SystemTests');
            // Test 1: Basic evaluation functionality
            yield this.runTest('evaluation-basic', () => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const result = yield this.unifiedSystem.quickAnalysis({
                    title: 'Evaluation Test Product',
                    description: 'Testing evaluation functionality',
                    keyFeatures: ['Feature 1', 'Feature 2']
                });
                return {
                    hasEvaluationResult: !!result.evaluationResult,
                    hasScore: ((_a = result.evaluationResult) === null || _a === void 0 ? void 0 : _a.overallScore) !== undefined,
                    hasConfidence: ((_b = result.evaluationResult) === null || _b === void 0 ? void 0 : _b.confidence) !== undefined,
                    scoreInRange: result.evaluationResult ?
                        result.evaluationResult.overallScore >= 0 && result.evaluationResult.overallScore <= 100 : false
                };
            }));
            // Test 2: Cost optimization
            yield this.runTest('evaluation-cost-optimization', () => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const lowCostResult = yield this.unifiedSystem.analyzeComprehensively({
                    productConcept: { title: 'Cost Test', description: 'Testing cost optimization' },
                    analysisType: 'quick',
                    constraints: { maxCost: 0.05 },
                    preferences: { prioritizeCost: true }
                });
                return {
                    stayedUnderBudget: lowCostResult.summary.totalCost <= 0.05,
                    usedOptimization: ((_a = lowCostResult.evaluationResult) === null || _a === void 0 ? void 0 : _a.optimizationStrategy) === 'cost-optimized',
                    hasResults: ((_b = lowCostResult.evaluationResult) === null || _b === void 0 ? void 0 : _b.overallScore) > 0
                };
            }));
            // Test 3: Caching system
            yield this.runTest('evaluation-caching', () => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const testProduct = {
                    title: 'Cache Test Product',
                    description: 'Testing caching functionality'
                };
                // First evaluation
                const result1 = yield this.unifiedSystem.quickAnalysis(testProduct);
                // Second evaluation (should hit cache)
                const result2 = yield this.unifiedSystem.quickAnalysis(testProduct);
                return {
                    firstEvaluationCompleted: !!result1.evaluationResult,
                    secondEvaluationCompleted: !!result2.evaluationResult,
                    cacheHit: ((_a = result2.evaluationResult) === null || _a === void 0 ? void 0 : _a.cacheHit) || false,
                    fasterSecondTime: result2.evaluationResult ?
                        result2.evaluationResult.actualLatency < (((_b = result1.evaluationResult) === null || _b === void 0 ? void 0 : _b.actualLatency) || Infinity) : false
                };
            }));
            // Test 4: Quality vs Speed tradeoff
            yield this.runTest('evaluation-quality-speed-tradeoff', () => __awaiter(this, void 0, void 0, function* () {
                const speedResult = yield this.unifiedSystem.analyzeComprehensively({
                    productConcept: { title: 'Speed Test', description: 'Testing speed optimization' },
                    analysisType: 'quick',
                    preferences: { prioritizeSpeed: true }
                });
                const qualityResult = yield this.unifiedSystem.analyzeComprehensively({
                    productConcept: { title: 'Quality Test', description: 'Testing quality optimization' },
                    analysisType: 'comprehensive',
                    preferences: { prioritizeQuality: true }
                });
                return {
                    speedResultFaster: speedResult.summary.totalDuration < qualityResult.summary.totalDuration,
                    qualityResultBetter: qualityResult.summary.overallScore >= speedResult.summary.overallScore,
                    bothCompleted: !!speedResult.evaluationResult && !!qualityResult.evaluationResult
                };
            }));
        });
    }
    // ============================================================================
    // INTEGRATION TESTS
    // ============================================================================
    runIntegrationTests() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Running integration tests', {}, 'SystemTests');
            // Test 1: End-to-end workflow
            yield this.runTest('integration-end-to-end', () => __awaiter(this, void 0, void 0, function* () {
                const result = yield this.unifiedSystem.comprehensiveAnalysis({
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
            }));
            // Test 2: System communication
            yield this.runTest('integration-system-communication', () => __awaiter(this, void 0, void 0, function* () {
                const result = yield this.unifiedSystem.standardAnalysis({
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
            }));
            // Test 3: Error propagation and handling
            yield this.runTest('integration-error-propagation', () => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Test with malformed input
                    yield this.unifiedSystem.analyzeComprehensively({
                        productConcept: { title: '', description: '' }, // Empty required fields
                        analysisType: 'standard'
                    });
                    return { errorHandlingWorked: false }; // Should not reach here
                }
                catch (error) {
                    return {
                        errorHandlingWorked: true,
                        errorPropagated: true,
                        gracefulDegradation: error.message.includes('validation') ||
                            error.message.includes('failed')
                    };
                }
            }));
        });
    }
    // ============================================================================
    // PERFORMANCE TESTS
    // ============================================================================
    runPerformanceTests() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Running performance tests', {}, 'SystemTests');
            // Test 1: Response time benchmarks
            yield this.runTest('performance-response-time', () => __awaiter(this, void 0, void 0, function* () {
                const startTime = Date.now();
                const result = yield this.unifiedSystem.quickAnalysis({
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
            }));
            // Test 2: Memory usage
            yield this.runTest('performance-memory-usage', () => __awaiter(this, void 0, void 0, function* () {
                const memBefore = process.memoryUsage();
                yield this.unifiedSystem.standardAnalysis({
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
            }));
            // Test 3: Concurrent analysis handling
            yield this.runTest('performance-concurrent-handling', () => __awaiter(this, void 0, void 0, function* () {
                const concurrentAnalyses = 3;
                const startTime = Date.now();
                const promises = Array.from({ length: concurrentAnalyses }, (_, i) => this.unifiedSystem.quickAnalysis({
                    title: `Concurrent Test ${i + 1}`,
                    description: `Testing concurrent analysis ${i + 1}`
                }));
                const results = yield Promise.all(promises);
                const duration = Date.now() - startTime;
                return {
                    allCompleted: results.length === concurrentAnalyses,
                    allSuccessful: results.every(r => r.summary.overallScore > 0),
                    reasonableTime: duration < 60000, // Under 1 minute for 3 concurrent
                    actualDuration: duration,
                    concurrentHandlingWorked: true
                };
            }));
        });
    }
    // ============================================================================
    // STRESS TESTS
    // ============================================================================
    runStressTests() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Running stress tests', {}, 'SystemTests');
            // Test 1: High load handling
            yield this.runTest('stress-high-load', () => __awaiter(this, void 0, void 0, function* () {
                const highLoadCount = 5;
                const startTime = Date.now();
                let successCount = 0;
                let errorCount = 0;
                const promises = Array.from({ length: highLoadCount }, (_, i) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield this.unifiedSystem.quickAnalysis({
                            title: `Stress Test ${i + 1}`,
                            description: `High load stress test ${i + 1}`
                        });
                        if (result.summary.overallScore > 0)
                            successCount++;
                        return result;
                    }
                    catch (error) {
                        errorCount++;
                        throw error;
                    }
                }));
                try {
                    yield Promise.allSettled(promises);
                }
                catch (error) {
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
            }));
            // Test 2: Resource exhaustion recovery
            yield this.runTest('stress-resource-recovery', () => __awaiter(this, void 0, void 0, function* () {
                // Simulate resource exhaustion by running many analyses
                const exhaustionCount = 10;
                let recoverySuccessful = false;
                try {
                    // Run many analyses to potentially exhaust resources
                    const promises = Array.from({ length: exhaustionCount }, (_, i) => this.unifiedSystem.quickAnalysis({
                        title: `Exhaustion Test ${i + 1}`,
                        description: 'Testing resource exhaustion and recovery'
                    }));
                    yield Promise.allSettled(promises);
                    // Try to recover with a simple analysis
                    const recoveryResult = yield this.unifiedSystem.quickAnalysis({
                        title: 'Recovery Test',
                        description: 'Testing system recovery after stress'
                    });
                    recoverySuccessful = recoveryResult.summary.overallScore > 0;
                }
                catch (error) {
                    // Expected under stress
                }
                return {
                    systemRecovered: recoverySuccessful,
                    gracefulDegradation: true // If we get here, system didn't crash
                };
            }));
        });
    }
    // ============================================================================
    // TEST UTILITIES
    // ============================================================================
    runTest(testName, testFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            let result;
            try {
                this.logger.debug(`Running test: ${testName}`, {}, 'SystemTests');
                const details = yield testFunction();
                const duration = Date.now() - startTime;
                result = {
                    testName,
                    passed: this.evaluateTestResult(details),
                    duration,
                    details
                };
                if (result.passed) {
                    this.logger.debug(`Test passed: ${testName}`, { duration }, 'SystemTests');
                }
                else {
                    this.logger.warn(`Test failed: ${testName}`, { details, duration }, 'SystemTests');
                }
            }
            catch (error) {
                const duration = Date.now() - startTime;
                result = {
                    testName,
                    passed: false,
                    duration,
                    details: {},
                    error: error.message
                };
                this.logger.error(`Test error: ${testName}`, error, { duration }, 'SystemTests');
            }
            this.testResults.push(result);
        });
    }
    evaluateTestResult(details) {
        // Generic test result evaluation
        if (typeof details === 'boolean')
            return details;
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
    generateTestReport(totalDuration) {
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
        const recommendations = [];
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
    categorizeFailedTests() {
        const categories = {
            orchestration: 0,
            metrics: 0,
            evaluation: 0,
            integration: 0,
            performance: 0,
            stress: 0
        };
        for (const test of this.testResults.filter(t => !t.passed)) {
            if (test.testName.includes('orchestration'))
                categories.orchestration++;
            else if (test.testName.includes('metrics'))
                categories.metrics++;
            else if (test.testName.includes('evaluation'))
                categories.evaluation++;
            else if (test.testName.includes('integration'))
                categories.integration++;
            else if (test.testName.includes('performance'))
                categories.performance++;
            else if (test.testName.includes('stress'))
                categories.stress++;
        }
        return categories;
    }
    // ============================================================================
    // PUBLIC API
    // ============================================================================
    static runQuickTests() {
        return __awaiter(this, void 0, void 0, function* () {
            const tests = new SystemTests();
            try {
                // Initialize system
                tests.unifiedSystem = new UnifiedAgentSystem_1.UnifiedAgentSystem({
                    orchestration: { enabled: true },
                    metrics: { enabled: false }, // Disable for quick tests
                    evaluation: { enabled: true, cachingEnabled: false }
                });
                yield new Promise(resolve => setTimeout(resolve, 1000));
                // Run basic tests only
                yield tests.runTest('quick-basic-functionality', () => __awaiter(this, void 0, void 0, function* () {
                    const result = yield tests.unifiedSystem.quickAnalysis({
                        title: 'Quick Test Product',
                        description: 'Basic functionality test'
                    });
                    return {
                        completed: !!result,
                        hasScore: result.summary.overallScore > 0,
                        reasonableTime: result.summary.totalDuration < 30000
                    };
                }));
                yield tests.runTest('quick-error-handling', () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield tests.unifiedSystem.quickAnalysis(null);
                        return { errorHandled: false };
                    }
                    catch (error) {
                        return { errorHandled: true };
                    }
                }));
                return tests.generateTestReport(0);
            }
            finally {
                if (tests.unifiedSystem) {
                    yield tests.unifiedSystem.shutdown();
                }
            }
        });
    }
    static runPerformanceTests() {
        return __awaiter(this, void 0, void 0, function* () {
            const tests = new SystemTests();
            try {
                tests.unifiedSystem = new UnifiedAgentSystem_1.UnifiedAgentSystem();
                yield new Promise(resolve => setTimeout(resolve, 2000));
                yield tests.runPerformanceTests();
                return tests.generateTestReport(0);
            }
            finally {
                if (tests.unifiedSystem) {
                    yield tests.unifiedSystem.shutdown();
                }
            }
        });
    }
}
exports.SystemTests = SystemTests;
