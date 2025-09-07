"use strict";
/**
 * Metrics Agent - Specialized agent for automated data gathering and analysis
 * Provides intelligent insights and automated reporting for the Agentic PM system
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
exports.MetricsAgent = void 0;
const MetricsCollector_1 = require("./MetricsCollector");
const errorHandling_1 = require("../utils/errorHandling");
const MultiModelAI_1 = require("../services/MultiModelAI");
// ============================================================================
// METRICS AGENT
// ============================================================================
class MetricsAgent {
    constructor() {
        this.insightsCache = new Map();
        this.analysisHistory = [];
        // Benchmarks for key metrics (industry standards)
        this.benchmarks = {
            [MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_7D]: 40, // 40% 7-day retention
            [MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_30D]: 20, // 20% 30-day retention
            [MetricsCollector_1.BUSINESS_METRICS.COMPLETION_RATE]: 80, // 80% workflow completion
            [MetricsCollector_1.BUSINESS_METRICS.ERROR_RATE]: 1, // <1% error rate
            [MetricsCollector_1.BUSINESS_METRICS.RESPONSE_TIME]: 2000, // <2s response time
            [MetricsCollector_1.BUSINESS_METRICS.AI_SUCCESS_RATE]: 95, // 95% AI success rate
            [MetricsCollector_1.BUSINESS_METRICS.NET_PROMOTER_SCORE]: 50, // NPS of 50
            [MetricsCollector_1.BUSINESS_METRICS.VIRAL_COEFFICIENT]: 0.5, // 0.5 viral coefficient
        };
        this.metricsCollector = new MetricsCollector_1.MetricsCollector();
        this.multiModelAI = new MultiModelAI_1.MultiModelAI();
        this.logger = errorHandling_1.Logger.getInstance();
        this.initializeDefaultAlerts();
        this.initializeDefaultDashboards();
        this.setupAutomatedAnalysis();
    }
    // ============================================================================
    // MAIN ANALYSIS METHODS
    // ============================================================================
    analyzeMetrics(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            this.logger.setContext(analysisId);
            this.logger.info('Starting metrics analysis', {
                timeRange: request.timeRange,
                focusAreas: request.focusAreas,
                customMetrics: request.customMetrics
            }, 'MetricsAgent');
            try {
                const insights = [];
                // 1. Trend Analysis
                const trendInsights = yield this.analyzeTrends(request);
                insights.push(...trendInsights);
                // 2. Anomaly Detection
                if (request.includeAnomalyDetection) {
                    const anomalyInsights = yield this.detectAnomalies(request);
                    insights.push(...anomalyInsights);
                }
                // 3. Correlation Analysis
                if (request.includeCorrelationAnalysis) {
                    const correlationInsights = yield this.analyzeCorrelations(request);
                    insights.push(...correlationInsights);
                }
                // 4. Predictive Analysis
                if (request.includePredictions) {
                    const predictionInsights = yield this.generatePredictions(request);
                    insights.push(...predictionInsights);
                }
                // 5. Business Impact Analysis
                const businessInsights = yield this.analyzeBusinessImpact(request);
                insights.push(...businessInsights);
                // Sort insights by severity and confidence
                insights.sort((a, b) => {
                    const severityOrder = { 'critical': 3, 'warning': 2, 'info': 1 };
                    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
                    if (severityDiff !== 0)
                        return severityDiff;
                    return b.confidence - a.confidence;
                });
                // Cache insights
                this.insightsCache.set(request.timeRange, insights);
                this.logger.info('Metrics analysis completed', {
                    insightsGenerated: insights.length,
                    criticalInsights: insights.filter(i => i.severity === 'critical').length
                }, 'MetricsAgent');
                return insights;
            }
            catch (error) {
                this.logger.error('Metrics analysis failed', error, {
                    timeRange: request.timeRange
                }, 'MetricsAgent');
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.PROCESSING_ERROR, `Metrics analysis failed: ${error.message}`, 'Unable to analyze metrics. Please try again.', { timeRange: request.timeRange }, true);
            }
        });
    }
    generateReport() {
        return __awaiter(this, arguments, void 0, function* (type = 'daily', customPeriod) {
            const reportId = `report_${type}_${Date.now()}`;
            let period;
            if (customPeriod) {
                period = customPeriod;
            }
            else {
                const now = new Date();
                switch (type) {
                    case 'daily':
                        period = {
                            start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                            end: now
                        };
                        break;
                    case 'weekly':
                        period = {
                            start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                            end: now
                        };
                        break;
                    case 'monthly':
                        period = {
                            start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                            end: now
                        };
                        break;
                    default:
                        period = {
                            start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                            end: now
                        };
                }
            }
            this.logger.info('Generating metrics report', {
                reportId,
                type,
                period
            }, 'MetricsAgent');
            try {
                // Analyze metrics for the period
                const timeRange = this.calculateTimeRange(period);
                const insights = yield this.analyzeMetrics({
                    timeRange,
                    includeAnomalyDetection: true,
                    includeCorrelationAnalysis: true,
                    includePredictions: type !== 'daily' // Skip predictions for daily reports
                });
                // Generate report sections
                const sections = yield this.generateReportSections(timeRange);
                // Calculate overall health
                const overallHealth = this.calculateOverallHealth(sections);
                // Generate key metrics summary
                const keyMetrics = this.generateKeyMetricsSummary(timeRange);
                // Generate recommendations
                const recommendations = yield this.generateRecommendations(insights, sections);
                const report = {
                    id: reportId,
                    type,
                    period,
                    summary: {
                        overallHealth,
                        keyMetrics,
                        topInsights: insights.slice(0, 5), // Top 5 insights
                        alertsSummary: this.calculateAlertsSummary()
                    },
                    sections,
                    recommendations,
                    generatedAt: new Date()
                };
                // Store report in history
                this.analysisHistory.push(report);
                if (this.analysisHistory.length > 100) {
                    this.analysisHistory = this.analysisHistory.slice(-100); // Keep last 100 reports
                }
                this.logger.info('Metrics report generated successfully', {
                    reportId,
                    overallHealth,
                    insightsCount: insights.length,
                    recommendationsCount: recommendations.length
                }, 'MetricsAgent');
                return report;
            }
            catch (error) {
                this.logger.error('Report generation failed', error, {
                    reportId,
                    type
                }, 'MetricsAgent');
                throw new errorHandling_1.AgenticError(errorHandling_1.ErrorCode.PROCESSING_ERROR, `Report generation failed: ${error.message}`, 'Unable to generate metrics report. Please try again.', { reportId, type }, true);
            }
        });
    }
    // ============================================================================
    // TREND ANALYSIS
    // ============================================================================
    analyzeTrends(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const insights = [];
            const metricsToAnalyze = request.customMetrics || Object.values(MetricsCollector_1.BUSINESS_METRICS);
            for (const metricName of metricsToAnalyze) {
                const summary = this.metricsCollector.calculateMetricSummary(metricName, request.timeRange);
                if (summary.count === 0)
                    continue;
                // Detect significant trends
                if (Math.abs(summary.changePercent) > 20) {
                    const isPositiveMetric = this.isPositiveMetric(metricName);
                    const isGoodTrend = (summary.changePercent > 0 && isPositiveMetric) ||
                        (summary.changePercent < 0 && !isPositiveMetric);
                    insights.push({
                        type: 'trend',
                        severity: Math.abs(summary.changePercent) > 50 ? 'critical' : 'warning',
                        title: `Significant ${summary.trend} trend in ${metricName}`,
                        description: `${metricName} has ${summary.trend === 'up' ? 'increased' : 'decreased'} by ${Math.abs(summary.changePercent).toFixed(1)}% over the ${request.timeRange} period.`,
                        metrics: [metricName],
                        evidence: [{
                                metric: metricName,
                                value: summary.current,
                                change: summary.changePercent,
                                timeRange: request.timeRange
                            }],
                        actionableRecommendations: isGoodTrend
                            ? [`Continue current strategies for ${metricName}`, `Analyze what's driving this positive trend`]
                            : [`Investigate root cause of ${metricName} decline`, `Implement corrective measures immediately`],
                        confidence: Math.min(95, 60 + Math.abs(summary.changePercent)),
                        timestamp: new Date()
                    });
                }
                // Check against benchmarks
                const benchmark = this.benchmarks[metricName];
                if (benchmark) {
                    const benchmarkDiff = ((summary.current - benchmark) / benchmark) * 100;
                    if (Math.abs(benchmarkDiff) > 15) {
                        const isBelowBenchmark = summary.current < benchmark;
                        insights.push({
                            type: 'recommendation',
                            severity: Math.abs(benchmarkDiff) > 30 ? 'critical' : 'warning',
                            title: `${metricName} ${isBelowBenchmark ? 'below' : 'above'} industry benchmark`,
                            description: `Current ${metricName} (${summary.current.toFixed(2)}) is ${Math.abs(benchmarkDiff).toFixed(1)}% ${isBelowBenchmark ? 'below' : 'above'} industry benchmark (${benchmark}).`,
                            metrics: [metricName],
                            evidence: [{
                                    metric: metricName,
                                    value: summary.current,
                                    change: benchmarkDiff,
                                    timeRange: request.timeRange
                                }],
                            actionableRecommendations: isBelowBenchmark
                                ? [`Focus on improving ${metricName}`, `Benchmark against top performers`, `Implement best practices`]
                                : [`Leverage ${metricName} strength`, `Share best practices`, `Maintain current performance`],
                            confidence: 85,
                            timestamp: new Date()
                        });
                    }
                }
            }
            return insights;
        });
    }
    // ============================================================================
    // ANOMALY DETECTION
    // ============================================================================
    detectAnomalies(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const insights = [];
            const metricsToAnalyze = request.customMetrics || Object.values(MetricsCollector_1.BUSINESS_METRICS);
            for (const metricName of metricsToAnalyze) {
                const data = this.metricsCollector.getMetricData(metricName, request.timeRange);
                if (data.length < 10)
                    continue; // Need sufficient data for anomaly detection
                const anomalies = this.detectStatisticalAnomalies(data);
                if (anomalies.length > 0) {
                    const severityLevel = anomalies.length > 5 ? 'critical' : 'warning';
                    insights.push({
                        type: 'anomaly',
                        severity: severityLevel,
                        title: `Anomalies detected in ${metricName}`,
                        description: `Detected ${anomalies.length} statistical anomalies in ${metricName} over the ${request.timeRange} period.`,
                        metrics: [metricName],
                        evidence: anomalies.slice(0, 3).map(anomaly => ({
                            metric: metricName,
                            value: anomaly.value,
                            change: anomaly.deviation,
                            timeRange: anomaly.timestamp.toISOString()
                        })),
                        actionableRecommendations: [
                            `Investigate unusual patterns in ${metricName}`,
                            'Check for external factors or system issues',
                            'Review data quality and collection methods'
                        ],
                        confidence: 75,
                        timestamp: new Date()
                    });
                }
            }
            return insights;
        });
    }
    detectStatisticalAnomalies(data) {
        if (data.length < 10)
            return [];
        const values = data.map(d => d.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const anomalies = [];
        const threshold = 2.5; // 2.5 standard deviations
        for (let i = 0; i < data.length; i++) {
            const deviation = Math.abs(data[i].value - mean) / stdDev;
            if (deviation > threshold) {
                anomalies.push({
                    timestamp: data[i].timestamp,
                    value: data[i].value,
                    deviation: deviation
                });
            }
        }
        return anomalies;
    }
    // ============================================================================
    // CORRELATION ANALYSIS
    // ============================================================================
    analyzeCorrelations(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const insights = [];
            const metricsToAnalyze = request.customMetrics || Object.values(MetricsCollector_1.BUSINESS_METRICS);
            // Analyze correlations between key metric pairs
            const metricPairs = [
                [MetricsCollector_1.BUSINESS_METRICS.USER_ACTIVATIONS, MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_7D],
                [MetricsCollector_1.BUSINESS_METRICS.DOCUMENT_QUALITY_SCORE, MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_30D],
                [MetricsCollector_1.BUSINESS_METRICS.RESPONSE_TIME, MetricsCollector_1.BUSINESS_METRICS.ERROR_RATE],
                [MetricsCollector_1.BUSINESS_METRICS.AI_SUCCESS_RATE, MetricsCollector_1.BUSINESS_METRICS.DOCUMENT_QUALITY_SCORE],
                [MetricsCollector_1.BUSINESS_METRICS.COMPLETION_RATE, MetricsCollector_1.BUSINESS_METRICS.NET_PROMOTER_SCORE]
            ];
            for (const [metric1, metric2] of metricPairs) {
                if (!metricsToAnalyze.includes(metric1) || !metricsToAnalyze.includes(metric2))
                    continue;
                const correlation = yield this.calculateCorrelation(metric1, metric2, request.timeRange);
                if (Math.abs(correlation) > 0.6) {
                    const isPositiveCorrelation = correlation > 0;
                    const strength = Math.abs(correlation) > 0.8 ? 'strong' : 'moderate';
                    insights.push({
                        type: 'correlation',
                        severity: 'info',
                        title: `${strength} ${isPositiveCorrelation ? 'positive' : 'negative'} correlation between ${metric1} and ${metric2}`,
                        description: `Found ${strength} ${isPositiveCorrelation ? 'positive' : 'negative'} correlation (${correlation.toFixed(2)}) between ${metric1} and ${metric2}.`,
                        metrics: [metric1, metric2],
                        evidence: [
                            {
                                metric: metric1,
                                value: this.metricsCollector.calculateMetricSummary(metric1, request.timeRange).current,
                                change: this.metricsCollector.calculateMetricSummary(metric1, request.timeRange).changePercent,
                                timeRange: request.timeRange
                            },
                            {
                                metric: metric2,
                                value: this.metricsCollector.calculateMetricSummary(metric2, request.timeRange).current,
                                change: this.metricsCollector.calculateMetricSummary(metric2, request.timeRange).changePercent,
                                timeRange: request.timeRange
                            }
                        ],
                        actionableRecommendations: [
                            `Monitor ${metric1} and ${metric2} together`,
                            `Leverage this correlation for predictive insights`,
                            `Focus on improving ${metric1} to impact ${metric2}`
                        ],
                        confidence: Math.round(Math.abs(correlation) * 100),
                        timestamp: new Date()
                    });
                }
            }
            return insights;
        });
    }
    calculateCorrelation(metric1, metric2, timeRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const data1 = this.metricsCollector.getMetricData(metric1, timeRange);
            const data2 = this.metricsCollector.getMetricData(metric2, timeRange);
            if (data1.length < 5 || data2.length < 5)
                return 0;
            // Align data points by timestamp (simplified)
            const alignedData = [];
            for (let i = 0; i < Math.min(data1.length, data2.length); i++) {
                alignedData.push({
                    x: data1[i].value,
                    y: data2[i].value
                });
            }
            if (alignedData.length < 3)
                return 0;
            // Calculate Pearson correlation coefficient
            const n = alignedData.length;
            const sumX = alignedData.reduce((sum, point) => sum + point.x, 0);
            const sumY = alignedData.reduce((sum, point) => sum + point.y, 0);
            const sumXY = alignedData.reduce((sum, point) => sum + point.x * point.y, 0);
            const sumXX = alignedData.reduce((sum, point) => sum + point.x * point.x, 0);
            const sumYY = alignedData.reduce((sum, point) => sum + point.y * point.y, 0);
            const numerator = n * sumXY - sumX * sumY;
            const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
            return denominator === 0 ? 0 : numerator / denominator;
        });
    }
    // ============================================================================
    // PREDICTIVE ANALYSIS
    // ============================================================================
    generatePredictions(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const insights = [];
            // Use AI to generate predictions based on historical data
            const keyMetrics = [
                MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_30D,
                MetricsCollector_1.BUSINESS_METRICS.REVENUE_PER_USER,
                MetricsCollector_1.BUSINESS_METRICS.CHURN_RATE,
                MetricsCollector_1.BUSINESS_METRICS.NET_PROMOTER_SCORE
            ];
            for (const metricName of keyMetrics) {
                try {
                    const historicalData = this.metricsCollector.getMetricData(metricName, '30d');
                    if (historicalData.length < 10)
                        continue;
                    const prediction = yield this.generateMetricPrediction(metricName, historicalData);
                    if (prediction.confidence > 60) {
                        insights.push({
                            type: 'prediction',
                            severity: prediction.trend === 'declining' ? 'warning' : 'info',
                            title: `${metricName} prediction: ${prediction.trend}`,
                            description: `Based on historical data, ${metricName} is predicted to ${prediction.direction} by ${prediction.changePercent.toFixed(1)}% over the next ${prediction.timeframe}.`,
                            metrics: [metricName],
                            evidence: [{
                                    metric: metricName,
                                    value: prediction.predictedValue,
                                    change: prediction.changePercent,
                                    timeRange: prediction.timeframe
                                }],
                            actionableRecommendations: prediction.trend === 'declining'
                                ? [`Take proactive measures to improve ${metricName}`, 'Monitor leading indicators closely']
                                : [`Prepare for expected growth in ${metricName}`, 'Optimize resources for projected demand'],
                            confidence: prediction.confidence,
                            timestamp: new Date()
                        });
                    }
                }
                catch (error) {
                    this.logger.warn(`Failed to generate prediction for ${metricName}`, {
                        error: error.message
                    }, 'MetricsAgent');
                }
            }
            return insights;
        });
    }
    generateMetricPrediction(metricName, historicalData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Simple linear regression for prediction
            const values = historicalData.map(d => d.value);
            const n = values.length;
            if (n < 3) {
                throw new Error('Insufficient data for prediction');
            }
            // Calculate trend
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            for (let i = 0; i < n; i++) {
                sumX += i;
                sumY += values[i];
                sumXY += i * values[i];
                sumXX += i * i;
            }
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            // Predict next period value
            const predictedValue = slope * n + intercept;
            const currentValue = values[n - 1];
            const changePercent = ((predictedValue - currentValue) / currentValue) * 100;
            let trend;
            let direction;
            if (Math.abs(changePercent) < 5) {
                trend = 'stable';
                direction = 'remain stable';
            }
            else if (changePercent > 0) {
                trend = this.isPositiveMetric(metricName) ? 'improving' : 'declining';
                direction = 'increase';
            }
            else {
                trend = this.isPositiveMetric(metricName) ? 'declining' : 'improving';
                direction = 'decrease';
            }
            // Calculate confidence based on data consistency
            const variance = values.reduce((sum, val) => sum + Math.pow(val - (sumY / n), 2), 0) / n;
            const stdDev = Math.sqrt(variance);
            const coefficient_of_variation = stdDev / (sumY / n);
            const confidence = Math.max(30, Math.min(95, 100 - (coefficient_of_variation * 100)));
            return {
                predictedValue,
                changePercent,
                trend,
                direction,
                timeframe: '7 days',
                confidence: Math.round(confidence)
            };
        });
    }
    // ============================================================================
    // BUSINESS IMPACT ANALYSIS
    // ============================================================================
    analyzeBusinessImpact(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const insights = [];
            // Analyze revenue impact
            const revenueMetrics = [
                MetricsCollector_1.BUSINESS_METRICS.REVENUE_PER_USER,
                MetricsCollector_1.BUSINESS_METRICS.CUSTOMER_LIFETIME_VALUE,
                MetricsCollector_1.BUSINESS_METRICS.UPGRADE_RATE
            ];
            for (const metricName of revenueMetrics) {
                const summary = this.metricsCollector.calculateMetricSummary(metricName, request.timeRange);
                if (summary.count > 0 && Math.abs(summary.changePercent) > 10) {
                    const impact = this.calculateRevenueImpact(metricName, summary.changePercent);
                    insights.push({
                        type: 'recommendation',
                        severity: Math.abs(summary.changePercent) > 25 ? 'critical' : 'warning',
                        title: `${metricName} change has significant business impact`,
                        description: `The ${summary.changePercent > 0 ? 'increase' : 'decrease'} in ${metricName} (${Math.abs(summary.changePercent).toFixed(1)}%) represents an estimated ${impact.direction} of $${Math.abs(impact.amount).toLocaleString()} in ${impact.timeframe}.`,
                        metrics: [metricName],
                        evidence: [{
                                metric: metricName,
                                value: summary.current,
                                change: summary.changePercent,
                                timeRange: request.timeRange
                            }],
                        actionableRecommendations: summary.changePercent > 0
                            ? [`Scale successful strategies for ${metricName}`, 'Investigate what drove this improvement', 'Apply learnings to other areas']
                            : [`Urgently address declining ${metricName}`, 'Implement recovery plan', 'Monitor closely for further changes'],
                        confidence: 80,
                        timestamp: new Date()
                    });
                }
            }
            return insights;
        });
    }
    calculateRevenueImpact(metricName, changePercent) {
        // Simplified revenue impact calculation
        const baseRevenue = 100000; // Assume $100k base monthly revenue
        let impactMultiplier = 0.1; // Default 10% impact
        switch (metricName) {
            case MetricsCollector_1.BUSINESS_METRICS.REVENUE_PER_USER:
                impactMultiplier = 1.0; // Direct impact
                break;
            case MetricsCollector_1.BUSINESS_METRICS.CUSTOMER_LIFETIME_VALUE:
                impactMultiplier = 0.8; // High impact
                break;
            case MetricsCollector_1.BUSINESS_METRICS.UPGRADE_RATE:
                impactMultiplier = 0.6; // Moderate impact
                break;
        }
        const amount = baseRevenue * (changePercent / 100) * impactMultiplier;
        return {
            amount: Math.abs(amount),
            direction: amount > 0 ? 'revenue increase' : 'revenue decrease',
            timeframe: 'monthly'
        };
    }
    // ============================================================================
    // REPORT GENERATION HELPERS
    // ============================================================================
    generateReportSections(timeRange) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                userEngagement: yield this.generateUserEngagementSection(timeRange),
                productQuality: yield this.generateProductQualitySection(timeRange),
                businessImpact: yield this.generateBusinessImpactSection(timeRange),
                systemPerformance: yield this.generateSystemPerformanceSection(timeRange),
                aiMetrics: yield this.generateAIMetricsSection(timeRange)
            };
        });
    }
    generateUserEngagementSection(timeRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const metrics = [
                MetricsCollector_1.BUSINESS_METRICS.USER_ACTIVATIONS,
                MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_7D,
                MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_30D,
                MetricsCollector_1.BUSINESS_METRICS.SESSION_DURATION,
                MetricsCollector_1.BUSINESS_METRICS.DOCUMENTS_CREATED
            ];
            const keyMetrics = metrics.map(metric => {
                const summary = this.metricsCollector.calculateMetricSummary(metric, timeRange);
                return {
                    name: metric,
                    value: summary.current,
                    change: summary.changePercent,
                    unit: 'count',
                    benchmark: this.benchmarks[metric]
                };
            }).filter(m => m.value > 0);
            const status = this.calculateSectionStatus(keyMetrics);
            return {
                title: 'User Engagement',
                status,
                keyMetrics,
                insights: [], // Will be populated by main analysis
                charts: keyMetrics.map(metric => ({
                    type: 'line',
                    title: metric.name,
                    metric: metric.name,
                    data: this.metricsCollector.getMetricData(metric.name, timeRange)
                }))
            };
        });
    }
    generateProductQualitySection(timeRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const metrics = [
                MetricsCollector_1.BUSINESS_METRICS.DOCUMENT_QUALITY_SCORE,
                MetricsCollector_1.BUSINESS_METRICS.COMPLETION_RATE,
                MetricsCollector_1.BUSINESS_METRICS.ERROR_RATE,
                MetricsCollector_1.BUSINESS_METRICS.AI_RESPONSE_QUALITY
            ];
            const keyMetrics = metrics.map(metric => {
                const summary = this.metricsCollector.calculateMetricSummary(metric, timeRange);
                return {
                    name: metric,
                    value: summary.current,
                    change: summary.changePercent,
                    unit: metric.includes('rate') ? '%' : 'score',
                    benchmark: this.benchmarks[metric]
                };
            }).filter(m => m.value > 0);
            return {
                title: 'Product Quality',
                status: this.calculateSectionStatus(keyMetrics),
                keyMetrics,
                insights: [],
                charts: keyMetrics.map(metric => ({
                    type: 'bar',
                    title: metric.name,
                    metric: metric.name,
                    data: this.metricsCollector.getMetricData(metric.name, timeRange)
                }))
            };
        });
    }
    generateBusinessImpactSection(timeRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const metrics = [
                MetricsCollector_1.BUSINESS_METRICS.REVENUE_PER_USER,
                MetricsCollector_1.BUSINESS_METRICS.CUSTOMER_LIFETIME_VALUE,
                MetricsCollector_1.BUSINESS_METRICS.CHURN_RATE,
                MetricsCollector_1.BUSINESS_METRICS.NET_PROMOTER_SCORE
            ];
            const keyMetrics = metrics.map(metric => {
                const summary = this.metricsCollector.calculateMetricSummary(metric, timeRange);
                return {
                    name: metric,
                    value: summary.current,
                    change: summary.changePercent,
                    unit: metric.includes('rate') ? '%' : '$',
                    benchmark: this.benchmarks[metric]
                };
            }).filter(m => m.value > 0);
            return {
                title: 'Business Impact',
                status: this.calculateSectionStatus(keyMetrics),
                keyMetrics,
                insights: [],
                charts: keyMetrics.map(metric => ({
                    type: 'gauge',
                    title: metric.name,
                    metric: metric.name,
                    data: this.metricsCollector.getMetricData(metric.name, timeRange)
                }))
            };
        });
    }
    generateSystemPerformanceSection(timeRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const metrics = [
                MetricsCollector_1.BUSINESS_METRICS.RESPONSE_TIME,
                MetricsCollector_1.BUSINESS_METRICS.ERROR_RATE,
                'system.uptime',
                'system.memory.rss'
            ];
            const keyMetrics = metrics.map(metric => {
                const summary = this.metricsCollector.calculateMetricSummary(metric, timeRange);
                return {
                    name: metric,
                    value: summary.current,
                    change: summary.changePercent,
                    unit: metric.includes('time') ? 'ms' : metric.includes('memory') ? 'MB' : 'count',
                    benchmark: this.benchmarks[metric]
                };
            }).filter(m => m.value > 0);
            return {
                title: 'System Performance',
                status: this.calculateSectionStatus(keyMetrics),
                keyMetrics,
                insights: [],
                charts: keyMetrics.map(metric => ({
                    type: 'line',
                    title: metric.name,
                    metric: metric.name,
                    data: this.metricsCollector.getMetricData(metric.name, timeRange)
                }))
            };
        });
    }
    generateAIMetricsSection(timeRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const metrics = [
                MetricsCollector_1.BUSINESS_METRICS.AI_SUCCESS_RATE,
                MetricsCollector_1.BUSINESS_METRICS.AI_COST_PER_REQUEST,
                MetricsCollector_1.BUSINESS_METRICS.AI_LATENCY,
                MetricsCollector_1.BUSINESS_METRICS.MODEL_ACCURACY,
                MetricsCollector_1.BUSINESS_METRICS.TOKEN_USAGE
            ];
            const keyMetrics = metrics.map(metric => {
                const summary = this.metricsCollector.calculateMetricSummary(metric, timeRange);
                return {
                    name: metric,
                    value: summary.current,
                    change: summary.changePercent,
                    unit: metric.includes('cost') ? '$' : metric.includes('rate') || metric.includes('accuracy') ? '%' : 'count',
                    benchmark: this.benchmarks[metric]
                };
            }).filter(m => m.value > 0);
            return {
                title: 'AI System Metrics',
                status: this.calculateSectionStatus(keyMetrics),
                keyMetrics,
                insights: [],
                charts: keyMetrics.map(metric => ({
                    type: 'line',
                    title: metric.name,
                    metric: metric.name,
                    data: this.metricsCollector.getMetricData(metric.name, timeRange)
                }))
            };
        });
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    calculateSectionStatus(keyMetrics) {
        if (keyMetrics.length === 0)
            return 'healthy';
        let criticalCount = 0;
        let warningCount = 0;
        for (const metric of keyMetrics) {
            if (metric.benchmark) {
                const deviation = Math.abs((metric.value - metric.benchmark) / metric.benchmark) * 100;
                if (deviation > 30)
                    criticalCount++;
                else if (deviation > 15)
                    warningCount++;
            }
            else {
                // Use change percentage as indicator
                if (Math.abs(metric.change) > 30)
                    criticalCount++;
                else if (Math.abs(metric.change) > 15)
                    warningCount++;
            }
        }
        if (criticalCount > 0)
            return 'critical';
        if (warningCount > keyMetrics.length / 2)
            return 'warning';
        return 'healthy';
    }
    calculateOverallHealth(sections) {
        const sectionStatuses = Object.values(sections).map(section => section.status);
        const criticalCount = sectionStatuses.filter(s => s === 'critical').length;
        const warningCount = sectionStatuses.filter(s => s === 'warning').length;
        if (criticalCount > 0)
            return 'critical';
        if (warningCount > sectionStatuses.length / 2)
            return 'warning';
        return 'healthy';
    }
    generateKeyMetricsSummary(timeRange) {
        const keyMetrics = [
            MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_30D,
            MetricsCollector_1.BUSINESS_METRICS.COMPLETION_RATE,
            MetricsCollector_1.BUSINESS_METRICS.NET_PROMOTER_SCORE,
            MetricsCollector_1.BUSINESS_METRICS.ERROR_RATE
        ];
        const summary = {};
        for (const metric of keyMetrics) {
            const metricSummary = this.metricsCollector.calculateMetricSummary(metric, timeRange);
            if (metricSummary.count > 0) {
                summary[metric] = {
                    current: metricSummary.current,
                    change: metricSummary.changePercent,
                    trend: metricSummary.trend
                };
            }
        }
        return summary;
    }
    calculateAlertsSummary() {
        const alerts = this.metricsCollector.getActiveAlerts();
        return {
            total: alerts.length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            resolved: 0 // Would track resolved alerts in a real implementation
        };
    }
    generateRecommendations(insights, sections) {
        return __awaiter(this, void 0, void 0, function* () {
            const recommendations = [];
            // Extract recommendations from critical and warning insights
            const criticalInsights = insights.filter(i => i.severity === 'critical');
            const warningInsights = insights.filter(i => i.severity === 'warning');
            for (const insight of criticalInsights) {
                for (const recommendation of insight.actionableRecommendations.slice(0, 2)) {
                    recommendations.push({
                        priority: 'high',
                        category: insight.type,
                        action: recommendation,
                        expectedImpact: 'High - addresses critical issue',
                        effort: 'medium'
                    });
                }
            }
            for (const insight of warningInsights.slice(0, 3)) {
                for (const recommendation of insight.actionableRecommendations.slice(0, 1)) {
                    recommendations.push({
                        priority: 'medium',
                        category: insight.type,
                        action: recommendation,
                        expectedImpact: 'Medium - improves performance',
                        effort: 'low'
                    });
                }
            }
            // Add general recommendations based on section health
            Object.entries(sections).forEach(([sectionName, section]) => {
                if (section.status === 'critical') {
                    recommendations.push({
                        priority: 'high',
                        category: sectionName,
                        action: `Immediate attention required for ${section.title}`,
                        expectedImpact: 'High - prevents further degradation',
                        effort: 'high'
                    });
                }
            });
            return recommendations.slice(0, 10); // Limit to top 10 recommendations
        });
    }
    isPositiveMetric(metricName) {
        const positiveMetrics = [
            MetricsCollector_1.BUSINESS_METRICS.USER_ACTIVATIONS,
            MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_7D,
            MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_30D,
            MetricsCollector_1.BUSINESS_METRICS.SESSION_DURATION,
            MetricsCollector_1.BUSINESS_METRICS.DOCUMENTS_CREATED,
            MetricsCollector_1.BUSINESS_METRICS.DOCUMENT_QUALITY_SCORE,
            MetricsCollector_1.BUSINESS_METRICS.COMPLETION_RATE,
            MetricsCollector_1.BUSINESS_METRICS.AI_RESPONSE_QUALITY,
            MetricsCollector_1.BUSINESS_METRICS.REVENUE_PER_USER,
            MetricsCollector_1.BUSINESS_METRICS.CUSTOMER_LIFETIME_VALUE,
            MetricsCollector_1.BUSINESS_METRICS.NET_PROMOTER_SCORE,
            MetricsCollector_1.BUSINESS_METRICS.VIRAL_COEFFICIENT,
            MetricsCollector_1.BUSINESS_METRICS.AI_SUCCESS_RATE,
            MetricsCollector_1.BUSINESS_METRICS.MODEL_ACCURACY
        ];
        return positiveMetrics.includes(metricName);
    }
    calculateTimeRange(period) {
        const diffMs = period.end.getTime() - period.start.getTime();
        const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
        if (diffDays <= 1)
            return '24h';
        if (diffDays <= 7)
            return '7d';
        if (diffDays <= 30)
            return '30d';
        return `${diffDays}d`;
    }
    initializeDefaultAlerts() {
        const defaultAlerts = [
            {
                metricName: MetricsCollector_1.BUSINESS_METRICS.ERROR_RATE,
                condition: 'greater_than',
                threshold: 5,
                timeWindow: 15,
                severity: 'critical'
            },
            {
                metricName: MetricsCollector_1.BUSINESS_METRICS.RESPONSE_TIME,
                condition: 'greater_than',
                threshold: 5000,
                timeWindow: 10,
                severity: 'warning'
            },
            {
                metricName: MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_7D,
                condition: 'less_than',
                threshold: 30,
                timeWindow: 60,
                severity: 'warning'
            }
        ];
        for (const alert of defaultAlerts) {
            this.metricsCollector.createAlert(alert);
        }
        this.logger.info('Initialized default alerts', {
            alertsCount: defaultAlerts.length
        }, 'MetricsAgent');
    }
    initializeDefaultDashboards() {
        const executiveDashboard = {
            name: 'Executive Dashboard',
            description: 'High-level business metrics for executives',
            widgets: [
                {
                    id: 'user-retention',
                    type: 'gauge',
                    title: '30-Day User Retention',
                    metricQueries: [{
                            metricName: MetricsCollector_1.BUSINESS_METRICS.USER_RETENTION_30D,
                            aggregation: 'avg',
                            timeRange: '30d',
                            filters: {}
                        }],
                    position: { x: 0, y: 0, width: 6, height: 4 },
                    config: { min: 0, max: 100, unit: '%' }
                },
                {
                    id: 'revenue-trend',
                    type: 'line_chart',
                    title: 'Revenue per User Trend',
                    metricQueries: [{
                            metricName: MetricsCollector_1.BUSINESS_METRICS.REVENUE_PER_USER,
                            aggregation: 'avg',
                            timeRange: '30d',
                            filters: {}
                        }],
                    position: { x: 6, y: 0, width: 6, height: 4 },
                    config: { showTrendLine: true }
                }
            ],
            refreshInterval: 300,
            isPublic: false,
            createdBy: 'system'
        };
        this.metricsCollector.createDashboard(executiveDashboard);
        this.logger.info('Initialized default dashboards', {
            dashboardsCount: 1
        }, 'MetricsAgent');
    }
    setupAutomatedAnalysis() {
        // Run automated analysis every hour
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const insights = yield this.analyzeMetrics({
                    timeRange: '1h',
                    includeAnomalyDetection: true,
                    includeCorrelationAnalysis: false,
                    includePredictions: false
                });
                const criticalInsights = insights.filter(i => i.severity === 'critical');
                if (criticalInsights.length > 0) {
                    this.logger.warn('Critical insights detected in automated analysis', {
                        criticalInsightsCount: criticalInsights.length
                    }, 'MetricsAgent');
                }
            }
            catch (error) {
                this.logger.error('Automated analysis failed', error, {}, 'MetricsAgent');
            }
        }), 60 * 60 * 1000); // Every hour
        this.logger.info('Automated analysis scheduled', {
            interval: '1 hour'
        }, 'MetricsAgent');
    }
    // ============================================================================
    // PUBLIC METHODS
    // ============================================================================
    startMetricsCollection() {
        this.metricsCollector.startCollection();
    }
    stopMetricsCollection() {
        this.metricsCollector.stopCollection();
    }
    recordMetric(metricName, value, unit, tags) {
        this.metricsCollector.recordMetric(metricName, value, unit, tags);
    }
    getMetricsCollector() {
        return this.metricsCollector;
    }
    getReportHistory() {
        return this.analysisHistory.slice(); // Return copy
    }
    getSystemHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.metricsCollector.getSystemHealth();
        });
    }
}
exports.MetricsAgent = MetricsAgent;
