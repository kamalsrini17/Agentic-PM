"use strict";
/**
 * Comprehensive Metrics Collection Infrastructure
 * Real-time monitoring, analytics, and performance optimization for Agentic PM
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
exports.MetricsCollector = exports.BUSINESS_METRICS = void 0;
const events_1 = require("events");
const errorHandling_1 = require("../utils/errorHandling");
// ============================================================================
// BUSINESS METRICS DEFINITIONS
// ============================================================================
exports.BUSINESS_METRICS = {
    // User Engagement Metrics
    USER_SIGNUPS: 'user.signups',
    USER_ACTIVATIONS: 'user.activations',
    USER_RETENTION_7D: 'user.retention.7d',
    USER_RETENTION_30D: 'user.retention.30d',
    SESSION_DURATION: 'user.session.duration',
    DOCUMENTS_CREATED: 'user.documents.created',
    DOCUMENTS_SHARED: 'user.documents.shared',
    // Product Quality Metrics
    DOCUMENT_QUALITY_SCORE: 'document.quality.score',
    COMPLETION_RATE: 'workflow.completion.rate',
    ERROR_RATE: 'system.error.rate',
    RESPONSE_TIME: 'system.response.time',
    AI_RESPONSE_QUALITY: 'ai.response.quality',
    // Business Impact Metrics
    REVENUE_PER_USER: 'business.revenue.per_user',
    CUSTOMER_LIFETIME_VALUE: 'business.clv',
    CHURN_RATE: 'business.churn.rate',
    NET_PROMOTER_SCORE: 'business.nps',
    COST_PER_ACQUISITION: 'business.cpa',
    // PLG Growth Metrics
    VIRAL_COEFFICIENT: 'growth.viral.coefficient',
    ORGANIC_GROWTH_RATE: 'growth.organic.rate',
    FEATURE_ADOPTION_RATE: 'growth.feature.adoption',
    UPGRADE_RATE: 'growth.upgrade.rate',
    REFERRAL_RATE: 'growth.referral.rate',
    // AI System Metrics
    AI_COST_PER_REQUEST: 'ai.cost.per_request',
    AI_LATENCY: 'ai.latency',
    AI_SUCCESS_RATE: 'ai.success.rate',
    MODEL_ACCURACY: 'ai.model.accuracy',
    TOKEN_USAGE: 'ai.token.usage'
};
// ============================================================================
// METRICS COLLECTOR
// ============================================================================
class MetricsCollector extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.config = config;
        this.metrics = new Map();
        this.alerts = new Map();
        this.dashboards = new Map();
        this.isCollecting = false;
        this.collectionInterval = null;
        this.retentionCleanupInterval = null;
        // Aggregation buffers for high-frequency metrics
        this.aggregationBuffers = new Map();
        this.bufferFlushInterval = null;
        this.logger = errorHandling_1.Logger.getInstance();
        // Set default configuration
        this.config = Object.assign({ collectionIntervalMs: 60000, bufferFlushIntervalMs: 10000, retentionCleanupHours: 24, maxDataPointsPerMetric: 10000 }, this.config);
        this.initializeDefaultMetrics();
        this.setupEventHandlers();
    }
    // ============================================================================
    // CORE METRICS COLLECTION
    // ============================================================================
    startCollection() {
        if (this.isCollecting) {
            this.logger.warn('Metrics collection already running', {}, 'MetricsCollector');
            return;
        }
        this.isCollecting = true;
        // Start periodic collection
        this.collectionInterval = setInterval(() => {
            this.collectSystemMetrics();
        }, this.config.collectionIntervalMs);
        // Start buffer flushing
        this.bufferFlushInterval = setInterval(() => {
            this.flushAggregationBuffers();
        }, this.config.bufferFlushIntervalMs);
        // Start retention cleanup
        this.retentionCleanupInterval = setInterval(() => {
            this.cleanupOldData();
        }, this.config.retentionCleanupHours * 60 * 60 * 1000);
        this.logger.info('Metrics collection started', {
            collectionInterval: this.config.collectionIntervalMs,
            bufferFlushInterval: this.config.bufferFlushIntervalMs
        }, 'MetricsCollector');
        this.emit('collection:started');
    }
    stopCollection() {
        if (!this.isCollecting)
            return;
        this.isCollecting = false;
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }
        if (this.bufferFlushInterval) {
            clearInterval(this.bufferFlushInterval);
            this.bufferFlushInterval = null;
        }
        if (this.retentionCleanupInterval) {
            clearInterval(this.retentionCleanupInterval);
            this.retentionCleanupInterval = null;
        }
        // Flush any remaining buffered data
        this.flushAggregationBuffers();
        this.logger.info('Metrics collection stopped', {}, 'MetricsCollector');
        this.emit('collection:stopped');
    }
    recordMetric(metricName, value, unit = 'count', tags = {}, metadata) {
        const dataPoint = {
            timestamp: new Date(),
            metricName,
            value,
            unit,
            tags,
            metadata
        };
        // For high-frequency metrics, use buffering
        if (this.isHighFrequencyMetric(metricName)) {
            this.bufferMetric(dataPoint);
        }
        else {
            this.storeMetric(dataPoint);
        }
        // Check alerts
        this.checkAlerts(metricName, value);
        this.emit('metric:recorded', { metricName, value, tags });
    }
    recordEvent(eventName, properties = {}, userId) {
        const eventMetric = {
            timestamp: new Date(),
            metricName: `event.${eventName}`,
            value: 1,
            unit: 'count',
            tags: Object.assign(Object.assign({ event_name: eventName }, (userId && { user_id: userId })), Object.fromEntries(Object.entries(properties).map(([k, v]) => [k, String(v)]))),
            metadata: properties
        };
        this.storeMetric(eventMetric);
        this.emit('event:recorded', { eventName, properties, userId });
    }
    // ============================================================================
    // AGGREGATION AND ANALYSIS
    // ============================================================================
    getMetricData(metricName, timeRange = '1h', aggregation = 'avg', filters = {}) {
        const series = this.metrics.get(metricName);
        if (!series)
            return [];
        const now = new Date();
        const timeRangeMs = this.parseTimeRange(timeRange);
        const startTime = new Date(now.getTime() - timeRangeMs);
        // Filter by time range
        let dataPoints = series.dataPoints.filter(dp => dp.timestamp >= startTime && dp.timestamp <= now);
        // Apply filters
        if (Object.keys(filters).length > 0) {
            dataPoints = dataPoints.filter(dp => Object.entries(filters).every(([key, value]) => dp.tags[key] === value));
        }
        // Apply aggregation if needed
        if (dataPoints.length > 100) {
            dataPoints = this.aggregateDataPoints(dataPoints, aggregation, 100);
        }
        return dataPoints;
    }
    calculateMetricSummary(metricName, timeRange = '1h', filters = {}) {
        var _a, _b;
        const currentData = this.getMetricData(metricName, timeRange, 'avg', filters);
        const previousTimeRange = this.getPreviousTimeRange(timeRange);
        const previousData = this.getMetricData(metricName, previousTimeRange, 'avg', filters);
        if (currentData.length === 0) {
            return {
                current: 0, previous: 0, change: 0, changePercent: 0,
                trend: 'stable', min: 0, max: 0, avg: 0, count: 0
            };
        }
        const currentValue = ((_a = currentData[currentData.length - 1]) === null || _a === void 0 ? void 0 : _a.value) || 0;
        const previousValue = ((_b = previousData[previousData.length - 1]) === null || _b === void 0 ? void 0 : _b.value) || 0;
        const change = currentValue - previousValue;
        const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
        const values = currentData.map(dp => dp.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        let trend = 'stable';
        if (Math.abs(changePercent) > 5) {
            trend = changePercent > 0 ? 'up' : 'down';
        }
        return {
            current: currentValue,
            previous: previousValue,
            change,
            changePercent,
            trend,
            min,
            max,
            avg,
            count: currentData.length
        };
    }
    // ============================================================================
    // ALERTS MANAGEMENT
    // ============================================================================
    createAlert(alert) {
        const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const fullAlert = Object.assign(Object.assign({}, alert), { id: alertId, isActive: true });
        this.alerts.set(alertId, fullAlert);
        this.logger.info('Alert created', {
            alertId,
            metricName: alert.metricName,
            condition: alert.condition,
            threshold: alert.threshold
        }, 'MetricsCollector');
        return alertId;
    }
    updateAlert(alertId, updates) {
        const alert = this.alerts.get(alertId);
        if (!alert)
            return false;
        Object.assign(alert, updates);
        this.alerts.set(alertId, alert);
        this.logger.info('Alert updated', { alertId, updates }, 'MetricsCollector');
        return true;
    }
    deleteAlert(alertId) {
        const deleted = this.alerts.delete(alertId);
        if (deleted) {
            this.logger.info('Alert deleted', { alertId }, 'MetricsCollector');
        }
        return deleted;
    }
    checkAlerts(metricName, value) {
        const relevantAlerts = Array.from(this.alerts.values()).filter(alert => alert.metricName === metricName && alert.isActive);
        for (const alert of relevantAlerts) {
            if (alert.suppressUntil && new Date() < alert.suppressUntil) {
                continue; // Alert is suppressed
            }
            let triggered = false;
            switch (alert.condition) {
                case 'greater_than':
                    triggered = value > alert.threshold;
                    break;
                case 'less_than':
                    triggered = value < alert.threshold;
                    break;
                case 'equals':
                    triggered = value === alert.threshold;
                    break;
                case 'not_equals':
                    triggered = value !== alert.threshold;
                    break;
                case 'rate_change':
                    // Calculate rate change over time window
                    const rateChange = this.calculateRateChange(metricName, alert.timeWindow);
                    triggered = Math.abs(rateChange) > alert.threshold;
                    break;
            }
            if (triggered) {
                this.triggerAlert(alert, value);
            }
        }
    }
    triggerAlert(alert, currentValue) {
        alert.lastTriggered = new Date();
        this.alerts.set(alert.id, alert);
        const alertEvent = {
            alertId: alert.id,
            metricName: alert.metricName,
            currentValue,
            threshold: alert.threshold,
            condition: alert.condition,
            severity: alert.severity,
            timestamp: new Date()
        };
        this.logger.warn('Alert triggered', alertEvent, 'MetricsCollector');
        this.emit('alert:triggered', alertEvent);
        // Record alert as a metric
        this.recordMetric('system.alerts.triggered', 1, 'count', {
            alert_id: alert.id,
            metric_name: alert.metricName,
            severity: alert.severity
        });
    }
    // ============================================================================
    // DASHBOARD MANAGEMENT
    // ============================================================================
    createDashboard(dashboard) {
        const dashboardId = `dash_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const fullDashboard = Object.assign(Object.assign({}, dashboard), { id: dashboardId, createdAt: new Date() });
        this.dashboards.set(dashboardId, fullDashboard);
        this.logger.info('Dashboard created', {
            dashboardId,
            name: dashboard.name,
            widgetCount: dashboard.widgets.length
        }, 'MetricsCollector');
        return dashboardId;
    }
    getDashboard(dashboardId) {
        return this.dashboards.get(dashboardId) || null;
    }
    getDashboardData(dashboardId) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard)
            return null;
        const dashboardData = {
            dashboard: dashboard,
            widgets: {}
        };
        // Collect data for each widget
        for (const widget of dashboard.widgets) {
            const widgetData = {};
            for (const query of widget.metricQueries) {
                const data = this.getMetricData(query.metricName, query.timeRange, query.aggregation, query.filters);
                widgetData[query.metricName] = {
                    data,
                    summary: this.calculateMetricSummary(query.metricName, query.timeRange, query.filters)
                };
            }
            dashboardData.widgets[widget.id] = widgetData;
        }
        return dashboardData;
    }
    // ============================================================================
    // SYSTEM METRICS COLLECTION
    // ============================================================================
    collectSystemMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Collect memory usage
                const memUsage = process.memoryUsage();
                this.recordMetric(exports.BUSINESS_METRICS.RESPONSE_TIME, memUsage.heapUsed / 1024 / 1024, 'MB', { type: 'heap' });
                this.recordMetric('system.memory.rss', memUsage.rss / 1024 / 1024, 'MB');
                // Collect CPU usage (simplified)
                const cpuUsage = process.cpuUsage();
                this.recordMetric('system.cpu.user', cpuUsage.user / 1000, 'ms');
                this.recordMetric('system.cpu.system', cpuUsage.system / 1000, 'ms');
                // Collect uptime
                this.recordMetric('system.uptime', process.uptime(), 'seconds');
                // Collect metrics about metrics
                this.recordMetric('system.metrics.count', this.metrics.size, 'count');
                this.recordMetric('system.alerts.count', this.alerts.size, 'count');
                this.recordMetric('system.dashboards.count', this.dashboards.size, 'count');
                // Collect active alerts
                const activeAlerts = Array.from(this.alerts.values()).filter(a => a.isActive).length;
                this.recordMetric('system.alerts.active', activeAlerts, 'count');
            }
            catch (error) {
                this.logger.error('Failed to collect system metrics', error, {}, 'MetricsCollector');
            }
        });
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    initializeDefaultMetrics() {
        Object.values(exports.BUSINESS_METRICS).forEach(metricName => {
            this.metrics.set(metricName, {
                metricName,
                dataPoints: [],
                aggregationType: 'avg',
                retention: 30 // 30 days default retention
            });
        });
        this.logger.info('Initialized default metrics', {
            metricsCount: Object.keys(exports.BUSINESS_METRICS).length
        }, 'MetricsCollector');
    }
    isHighFrequencyMetric(metricName) {
        const highFrequencyMetrics = [
            exports.BUSINESS_METRICS.RESPONSE_TIME,
            exports.BUSINESS_METRICS.AI_LATENCY,
            exports.BUSINESS_METRICS.ERROR_RATE,
            'system.cpu.user',
            'system.memory.rss'
        ];
        return highFrequencyMetrics.includes(metricName);
    }
    bufferMetric(dataPoint) {
        if (!this.aggregationBuffers.has(dataPoint.metricName)) {
            this.aggregationBuffers.set(dataPoint.metricName, []);
        }
        this.aggregationBuffers.get(dataPoint.metricName).push(dataPoint);
    }
    flushAggregationBuffers() {
        for (const [metricName, dataPoints] of this.aggregationBuffers.entries()) {
            if (dataPoints.length === 0)
                continue;
            // Aggregate buffered data points
            const aggregatedPoint = this.aggregateBufferedDataPoints(dataPoints);
            this.storeMetric(aggregatedPoint);
            // Clear buffer
            this.aggregationBuffers.set(metricName, []);
        }
    }
    aggregateBufferedDataPoints(dataPoints) {
        const avgValue = dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length;
        const latestPoint = dataPoints[dataPoints.length - 1];
        return Object.assign(Object.assign({}, latestPoint), { value: avgValue, metadata: Object.assign(Object.assign({}, latestPoint.metadata), { aggregated: true, originalCount: dataPoints.length, timeSpan: {
                    start: dataPoints[0].timestamp,
                    end: latestPoint.timestamp
                } }) });
    }
    storeMetric(dataPoint) {
        let series = this.metrics.get(dataPoint.metricName);
        if (!series) {
            series = {
                metricName: dataPoint.metricName,
                dataPoints: [],
                aggregationType: 'avg',
                retention: 30
            };
            this.metrics.set(dataPoint.metricName, series);
        }
        series.dataPoints.push(dataPoint);
        // Maintain max data points limit
        if (series.dataPoints.length > this.config.maxDataPointsPerMetric) {
            series.dataPoints = series.dataPoints.slice(-this.config.maxDataPointsPerMetric);
        }
    }
    parseTimeRange(timeRange) {
        const match = timeRange.match(/^(\d+)([smhd])$/);
        if (!match)
            return 60 * 60 * 1000; // Default 1 hour
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 60 * 60 * 1000;
        }
    }
    getPreviousTimeRange(timeRange) {
        // For comparison, get the same time range but shifted back
        const match = timeRange.match(/^(\d+)([smhd])$/);
        if (!match)
            return '2h';
        const value = parseInt(match[1]) * 2; // Double the time range for previous period
        const unit = match[2];
        return `${value}${unit}`;
    }
    aggregateDataPoints(dataPoints, aggregation, buckets) {
        if (dataPoints.length <= buckets)
            return dataPoints;
        const bucketSize = Math.ceil(dataPoints.length / buckets);
        const aggregated = [];
        for (let i = 0; i < dataPoints.length; i += bucketSize) {
            const bucket = dataPoints.slice(i, i + bucketSize);
            const values = bucket.map(dp => dp.value);
            let aggregatedValue;
            switch (aggregation) {
                case 'sum':
                    aggregatedValue = values.reduce((a, b) => a + b, 0);
                    break;
                case 'avg':
                    aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
                    break;
                case 'min':
                    aggregatedValue = Math.min(...values);
                    break;
                case 'max':
                    aggregatedValue = Math.max(...values);
                    break;
                case 'count':
                    aggregatedValue = values.length;
                    break;
            }
            aggregated.push(Object.assign(Object.assign({}, bucket[Math.floor(bucket.length / 2)]), { value: aggregatedValue, metadata: {
                    aggregated: true,
                    aggregationType: aggregation,
                    bucketSize: bucket.length
                } }));
        }
        return aggregated;
    }
    calculateRateChange(metricName, timeWindowMinutes) {
        const now = new Date();
        const windowStart = new Date(now.getTime() - (timeWindowMinutes * 60 * 1000));
        const previousWindowStart = new Date(windowStart.getTime() - (timeWindowMinutes * 60 * 1000));
        const currentData = this.getMetricData(metricName, `${timeWindowMinutes}m`);
        const previousData = this.getMetricData(metricName, `${timeWindowMinutes * 2}m`);
        if (currentData.length === 0 || previousData.length === 0)
            return 0;
        const currentAvg = currentData.reduce((sum, dp) => sum + dp.value, 0) / currentData.length;
        const previousAvg = previousData.slice(0, Math.floor(previousData.length / 2))
            .reduce((sum, dp) => sum + dp.value, 0) / Math.floor(previousData.length / 2);
        if (previousAvg === 0)
            return 0;
        return ((currentAvg - previousAvg) / previousAvg) * 100;
    }
    cleanupOldData() {
        let totalCleaned = 0;
        for (const [metricName, series] of this.metrics.entries()) {
            const retentionMs = series.retention * 24 * 60 * 60 * 1000;
            const cutoffTime = new Date(Date.now() - retentionMs);
            const originalCount = series.dataPoints.length;
            series.dataPoints = series.dataPoints.filter(dp => dp.timestamp > cutoffTime);
            const cleaned = originalCount - series.dataPoints.length;
            totalCleaned += cleaned;
        }
        if (totalCleaned > 0) {
            this.logger.info('Cleaned up old metric data', {
                dataPointsCleaned: totalCleaned,
                metricsProcessed: this.metrics.size
            }, 'MetricsCollector');
        }
    }
    setupEventHandlers() {
        this.on('metric:recorded', ({ metricName, value, tags }) => {
            // Could add additional processing here
        });
        this.on('alert:triggered', (alertEvent) => {
            // Could integrate with notification systems here
            this.logger.warn('Alert triggered', alertEvent, 'MetricsCollector');
        });
    }
    // ============================================================================
    // PUBLIC QUERY METHODS
    // ============================================================================
    getAllMetrics() {
        return Array.from(this.metrics.keys());
    }
    getMetricInfo(metricName) {
        return this.metrics.get(metricName) || null;
    }
    getActiveAlerts() {
        return Array.from(this.alerts.values()).filter(alert => alert.isActive);
    }
    getSystemHealth() {
        const activeAlerts = this.getActiveAlerts();
        const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
        const warningAlerts = activeAlerts.filter(a => a.severity === 'high' || a.severity === 'medium').length;
        let status = 'healthy';
        if (criticalAlerts > 0) {
            status = 'critical';
        }
        else if (warningAlerts > 0 || activeAlerts.length > 5) {
            status = 'warning';
        }
        return {
            status,
            metrics: {
                totalMetrics: this.metrics.size,
                totalDataPoints: Array.from(this.metrics.values()).reduce((sum, series) => sum + series.dataPoints.length, 0),
                isCollecting: this.isCollecting
            },
            alerts: activeAlerts.length,
            uptime: process.uptime()
        };
    }
    // Export data for external analysis
    exportMetrics(metricNames, timeRange = '24h', format = 'json') {
        const metricsToExport = metricNames || this.getAllMetrics();
        const exportData = {};
        for (const metricName of metricsToExport) {
            exportData[metricName] = this.getMetricData(metricName, timeRange);
        }
        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        }
        else {
            // Simple CSV export
            const csvLines = ['timestamp,metric,value,unit,tags'];
            for (const [metricName, dataPoints] of Object.entries(exportData)) {
                for (const dp of dataPoints) {
                    const tagsStr = Object.entries(dp.tags).map(([k, v]) => `${k}=${v}`).join(';');
                    csvLines.push(`${dp.timestamp.toISOString()},${metricName},${dp.value},${dp.unit},"${tagsStr}"`);
                }
            }
            return csvLines.join('\n');
        }
    }
}
exports.MetricsCollector = MetricsCollector;
