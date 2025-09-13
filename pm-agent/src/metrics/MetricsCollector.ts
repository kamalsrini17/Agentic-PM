/**
 * Comprehensive Metrics Collection Infrastructure
 * Real-time monitoring, analytics, and performance optimization for Agentic PM
 */

import { EventEmitter } from 'events';
import { Logger, AgenticError, ErrorCode } from '../utils/errorHandling';

// ============================================================================
// METRICS INTERFACES
// ============================================================================

export interface MetricDataPoint {
  timestamp: Date;
  metricName: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface MetricSeries {
  metricName: string;
  dataPoints: MetricDataPoint[];
  aggregationType: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'rate';
  retention: number; // Days to retain data
}

export interface MetricAlert {
  id: string;
  metricName: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'rate_change';
  threshold: number;
  timeWindow: number; // Minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  lastTriggered?: Date;
  suppressUntil?: Date;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  refreshInterval: number; // Seconds
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: 'line_chart' | 'bar_chart' | 'gauge' | 'counter' | 'table' | 'heatmap';
  title: string;
  metricQueries: MetricQuery[];
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
}

export interface MetricQuery {
  metricName: string;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'rate';
  timeRange: string; // e.g., '1h', '24h', '7d'
  filters: Record<string, string>;
  groupBy?: string[];
}

// ============================================================================
// BUSINESS METRICS DEFINITIONS
// ============================================================================

export const BUSINESS_METRICS = {
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

export class MetricsCollector extends EventEmitter {
  private metrics: Map<string, MetricSeries> = new Map();
  private alerts: Map<string, MetricAlert> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private logger: Logger;
  private isCollecting: boolean = false;
  private collectionInterval: NodeJS.Timeout | null = null;
  private retentionCleanupInterval: NodeJS.Timeout | null = null;

  // Aggregation buffers for high-frequency metrics
  private aggregationBuffers: Map<string, MetricDataPoint[]> = new Map();
  private bufferFlushInterval: NodeJS.Timeout | null = null;

  constructor(private config: {
    collectionIntervalMs?: number;
    bufferFlushIntervalMs?: number;
    retentionCleanupHours?: number;
    maxDataPointsPerMetric?: number;
  } = {}) {
    super();
    this.logger = Logger.getInstance();
    
    // Set default configuration
    this.config = {
      collectionIntervalMs: 60000, // 1 minute
      bufferFlushIntervalMs: 10000, // 10 seconds
      retentionCleanupHours: 24, // Daily cleanup
      maxDataPointsPerMetric: 10000,
      ...this.config
    };

    this.initializeDefaultMetrics();
    this.setupEventHandlers();
  }

  // ============================================================================
  // CORE METRICS COLLECTION
  // ============================================================================

  startCollection(): void {
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
    }, this.config.retentionCleanupHours! * 60 * 60 * 1000);

    this.logger.info('Metrics collection started', {
      collectionInterval: this.config.collectionIntervalMs,
      bufferFlushInterval: this.config.bufferFlushIntervalMs
    }, 'MetricsCollector');

    this.emit('collection:started');
  }

  stopCollection(): void {
    if (!this.isCollecting) return;

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

  recordMetric(
    metricName: string,
    value: number,
    unit: string = 'count',
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): void {
    const dataPoint: MetricDataPoint = {
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
    } else {
      this.storeMetric(dataPoint);
    }

    // Check alerts
    this.checkAlerts(metricName, value);

    this.emit('metric:recorded', { metricName, value, tags });
  }

  recordEvent(
    eventName: string,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    const eventMetric: MetricDataPoint = {
      timestamp: new Date(),
      metricName: `event.${eventName}`,
      value: 1,
      unit: 'count',
      tags: {
        event_name: eventName,
        ...(userId && { user_id: userId }),
        ...Object.fromEntries(
          Object.entries(properties).map(([k, v]) => [k, String(v)])
        )
      },
      metadata: properties
    };

    this.storeMetric(eventMetric);
    this.emit('event:recorded', { eventName, properties, userId });
  }

  // ============================================================================
  // AGGREGATION AND ANALYSIS
  // ============================================================================

  getMetricData(
    metricName: string,
    timeRange: string = '1h',
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'rate' = 'avg',
    filters: Record<string, string> = {}
  ): MetricDataPoint[] {
    const series = this.metrics.get(metricName);
    if (!series) return [];

    const now = new Date();
    const timeRangeMs = this.parseTimeRange(timeRange);
    const startTime = new Date(now.getTime() - timeRangeMs);

    // Filter by time range
    let dataPoints = series.dataPoints.filter(dp => 
      dp.timestamp >= startTime && dp.timestamp <= now
    );

    // Apply filters
    if (Object.keys(filters).length > 0) {
      dataPoints = dataPoints.filter(dp => 
        Object.entries(filters).every(([key, value]) => dp.tags[key] === value)
      );
    }

    // Apply aggregation if needed
    if (dataPoints.length > 100) {
      dataPoints = this.aggregateDataPoints(dataPoints, aggregation, 100);
    }

    return dataPoints;
  }

  calculateMetricSummary(
    metricName: string,
    timeRange: string = '1h',
    filters: Record<string, string> = {}
  ): {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: 'up' | 'down' | 'stable';
    min: number;
    max: number;
    avg: number;
    count: number;
  } {
    const currentData = this.getMetricData(metricName, timeRange, 'avg', filters);
    const previousTimeRange = this.getPreviousTimeRange(timeRange);
    const previousData = this.getMetricData(metricName, previousTimeRange, 'avg', filters);

    if (currentData.length === 0) {
      return {
        current: 0, previous: 0, change: 0, changePercent: 0,
        trend: 'stable', min: 0, max: 0, avg: 0, count: 0
      };
    }

    const currentValue = currentData[currentData.length - 1]?.value || 0;
    const previousValue = previousData[previousData.length - 1]?.value || 0;
    const change = currentValue - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;

    const values = currentData.map(dp => dp.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    let trend: 'up' | 'down' | 'stable' = 'stable';
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

  createAlert(alert: Omit<MetricAlert, 'id' | 'isActive' | 'lastTriggered'>): string {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const fullAlert: MetricAlert = {
      ...alert,
      id: alertId,
      isActive: true
    };

    this.alerts.set(alertId, fullAlert);
    
    this.logger.info('Alert created', {
      alertId,
      metricName: alert.metricName,
      condition: alert.condition,
      threshold: alert.threshold
    }, 'MetricsCollector');

    return alertId;
  }

  updateAlert(alertId: string, updates: Partial<MetricAlert>): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    Object.assign(alert, updates);
    this.alerts.set(alertId, alert);

    this.logger.info('Alert updated', { alertId, updates }, 'MetricsCollector');
    return true;
  }

  deleteAlert(alertId: string): boolean {
    const deleted = this.alerts.delete(alertId);
    if (deleted) {
      this.logger.info('Alert deleted', { alertId }, 'MetricsCollector');
    }
    return deleted;
  }

  private checkAlerts(metricName: string, value: number): void {
    const relevantAlerts = Array.from(this.alerts.values()).filter(
      alert => alert.metricName === metricName && alert.isActive
    );

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

  private triggerAlert(alert: MetricAlert, currentValue: number): void {
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
    this.recordMetric(
      'system.alerts.triggered',
      1,
      'count',
      {
        alert_id: alert.id,
        metric_name: alert.metricName,
        severity: alert.severity
      }
    );
  }

  // ============================================================================
  // DASHBOARD MANAGEMENT
  // ============================================================================

  createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt'>): string {
    const dashboardId = `dash_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const fullDashboard: Dashboard = {
      ...dashboard,
      id: dashboardId,
      createdAt: new Date()
    };

    this.dashboards.set(dashboardId, fullDashboard);
    
    this.logger.info('Dashboard created', {
      dashboardId,
      name: dashboard.name,
      widgetCount: dashboard.widgets.length
    }, 'MetricsCollector');

    return dashboardId;
  }

  getDashboard(dashboardId: string): Dashboard | null {
    return this.dashboards.get(dashboardId) || null;
  }

  getDashboardData(dashboardId: string): Record<string, any> | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const dashboardData: Record<string, any> = {
      dashboard: dashboard,
      widgets: {}
    };

    // Collect data for each widget
    for (const widget of dashboard.widgets) {
      const widgetData: Record<string, any> = {};

      for (const query of widget.metricQueries) {
        const data = this.getMetricData(
          query.metricName,
          query.timeRange,
          query.aggregation,
          query.filters
        );

        widgetData[query.metricName] = {
          data,
          summary: this.calculateMetricSummary(
            query.metricName,
            query.timeRange,
            query.filters
          )
        };
      }

      dashboardData.widgets[widget.id] = widgetData;
    }

    return dashboardData;
  }

  // ============================================================================
  // SYSTEM METRICS COLLECTION
  // ============================================================================

  private async collectSystemMetrics(): Promise<void> {
    try {
      // Collect memory usage
      const memUsage = process.memoryUsage();
      this.recordMetric(BUSINESS_METRICS.RESPONSE_TIME, memUsage.heapUsed / 1024 / 1024, 'MB', { type: 'heap' });
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

    } catch (error) {
      this.logger.error('Failed to collect system metrics', error as Error, {}, 'MetricsCollector');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private initializeDefaultMetrics(): void {
    Object.values(BUSINESS_METRICS).forEach(metricName => {
      this.metrics.set(metricName, {
        metricName,
        dataPoints: [],
        aggregationType: 'avg',
        retention: 30 // 30 days default retention
      });
    });

    this.logger.info('Initialized default metrics', {
      metricsCount: Object.keys(BUSINESS_METRICS).length
    }, 'MetricsCollector');
  }

  private isHighFrequencyMetric(metricName: string): boolean {
    const highFrequencyMetrics = [
      BUSINESS_METRICS.RESPONSE_TIME,
      BUSINESS_METRICS.AI_LATENCY,
      BUSINESS_METRICS.ERROR_RATE,
      'system.cpu.user',
      'system.memory.rss'
    ];
    return highFrequencyMetrics.includes(metricName);
  }

  private bufferMetric(dataPoint: MetricDataPoint): void {
    if (!this.aggregationBuffers.has(dataPoint.metricName)) {
      this.aggregationBuffers.set(dataPoint.metricName, []);
    }
    this.aggregationBuffers.get(dataPoint.metricName)!.push(dataPoint);
  }

  private flushAggregationBuffers(): void {
    for (const [metricName, dataPoints] of this.aggregationBuffers.entries()) {
      if (dataPoints.length === 0) continue;

      // Aggregate buffered data points
      const aggregatedPoint = this.aggregateBufferedDataPoints(dataPoints);
      this.storeMetric(aggregatedPoint);

      // Clear buffer
      this.aggregationBuffers.set(metricName, []);
    }
  }

  private aggregateBufferedDataPoints(dataPoints: MetricDataPoint[]): MetricDataPoint {
    const avgValue = dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length;
    const latestPoint = dataPoints[dataPoints.length - 1];

    return {
      ...latestPoint,
      value: avgValue,
      metadata: {
        ...latestPoint.metadata,
        aggregated: true,
        originalCount: dataPoints.length,
        timeSpan: {
          start: dataPoints[0].timestamp,
          end: latestPoint.timestamp
        }
      }
    };
  }

  private storeMetric(dataPoint: MetricDataPoint): void {
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
    if (series.dataPoints.length > this.config.maxDataPointsPerMetric!) {
      series.dataPoints = series.dataPoints.slice(-this.config.maxDataPointsPerMetric!);
    }
  }

  private parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/^(\d+)([smhd])$/);
    if (!match) return 60 * 60 * 1000; // Default 1 hour

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

  private getPreviousTimeRange(timeRange: string): string {
    // For comparison, get the same time range but shifted back
    const match = timeRange.match(/^(\d+)([smhd])$/);
    if (!match) return '2h';

    const value = parseInt(match[1]) * 2; // Double the time range for previous period
    const unit = match[2];
    return `${value}${unit}`;
  }

  private aggregateDataPoints(
    dataPoints: MetricDataPoint[],
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'rate',
    buckets: number
  ): MetricDataPoint[] {
    if (dataPoints.length <= buckets) return dataPoints;

    const bucketSize = Math.ceil(dataPoints.length / buckets);
    const aggregated: MetricDataPoint[] = [];

    for (let i = 0; i < dataPoints.length; i += bucketSize) {
      const bucket = dataPoints.slice(i, i + bucketSize);
      const values = bucket.map(dp => dp.value);
      
      let aggregatedValue: number;
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
        case 'rate':
          // Calculate rate as change per unit time
          if (values.length > 1) {
            const firstValue = values[0];
            const lastValue = values[values.length - 1];
            aggregatedValue = lastValue - firstValue;
          } else {
            aggregatedValue = values[0] || 0;
          }
          break;
        default:
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
      }

      aggregated.push({
        ...bucket[Math.floor(bucket.length / 2)], // Use middle point as representative
        value: aggregatedValue,
        metadata: {
          aggregated: true,
          aggregationType: aggregation,
          bucketSize: bucket.length
        }
      });
    }

    return aggregated;
  }

  private calculateRateChange(metricName: string, timeWindowMinutes: number): number {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (timeWindowMinutes * 60 * 1000));
    const previousWindowStart = new Date(windowStart.getTime() - (timeWindowMinutes * 60 * 1000));

    const currentData = this.getMetricData(metricName, `${timeWindowMinutes}m`);
    const previousData = this.getMetricData(metricName, `${timeWindowMinutes * 2}m`);

    if (currentData.length === 0 || previousData.length === 0) return 0;

    const currentAvg = currentData.reduce((sum, dp) => sum + dp.value, 0) / currentData.length;
    const previousAvg = previousData.slice(0, Math.floor(previousData.length / 2))
      .reduce((sum, dp) => sum + dp.value, 0) / Math.floor(previousData.length / 2);

    if (previousAvg === 0) return 0;
    return ((currentAvg - previousAvg) / previousAvg) * 100;
  }

  private cleanupOldData(): void {
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

  private setupEventHandlers(): void {
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

  getAllMetrics(): string[] {
    return Array.from(this.metrics.keys());
  }

  getMetricInfo(metricName: string): MetricSeries | null {
    return this.metrics.get(metricName) || null;
  }

  getActiveAlerts(): MetricAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.isActive);
  }

  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: Record<string, any>;
    alerts: number;
    uptime: number;
  } {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
    const warningAlerts = activeAlerts.filter(a => a.severity === 'high' || a.severity === 'medium').length;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts > 0) {
      status = 'critical';
    } else if (warningAlerts > 0 || activeAlerts.length > 5) {
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
  exportMetrics(
    metricNames?: string[],
    timeRange: string = '24h',
    format: 'json' | 'csv' = 'json'
  ): string {
    const metricsToExport = metricNames || this.getAllMetrics();
    const exportData: Record<string, any> = {};

    for (const metricName of metricsToExport) {
      exportData[metricName] = this.getMetricData(metricName, timeRange);
    }

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else {
      // Simple CSV export
      const csvLines: string[] = ['timestamp,metric,value,unit,tags'];
      
      for (const [metricName, dataPoints] of Object.entries(exportData)) {
        for (const dp of dataPoints as MetricDataPoint[]) {
          const tagsStr = Object.entries(dp.tags).map(([k, v]) => `${k}=${v}`).join(';');
          csvLines.push(`${dp.timestamp.toISOString()},${metricName},${dp.value},${dp.unit},"${tagsStr}"`);
        }
      }

      return csvLines.join('\n');
    }
  }
}