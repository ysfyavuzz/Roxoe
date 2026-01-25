/**
 * PerformanceMonitor.ts
 * Advanced database performance monitoring and analytics system
 * Tracks query performance, identifies bottlenecks, and provides optimization insights
 */

// Performance monitoring interfaces
export interface PerformanceMetric {
  id: string;
  operation: string;
  database: string;
  table: string;
  duration: number; // milliseconds
  recordCount?: number;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'INDEX' | 'TRANSACTION';
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceStats {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: PerformanceMetric[];
  fastQueries: PerformanceMetric[];
  queryTypeDistribution: Record<string, number>;
  databaseStats: Record<string, {
    queryCount: number;
    avgTime: number;
    totalTime: number;
  }>;
  tableStats: Record<string, {
    queryCount: number;
    avgTime: number;
    totalTime: number;
  }>;
  hourlyStats: Array<{
    hour: string;
    queryCount: number;
    avgTime: number;
  }>;
  performanceTrends: {
    improvementSinceLastWeek: number;
    slowestOperations: Array<{
      operation: string;
      avgTime: number;
      frequency: number;
    }>;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'SLOW_QUERY' | 'HIGH_FREQUENCY' | 'ERROR_RATE' | 'MEMORY_USAGE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details: string;
  timestamp: Date;
  resolved: boolean;
  recommendations: string[];
}

export interface PerformanceConfig {
  enabled: boolean;
  slowQueryThreshold: number; // milliseconds
  maxStoredMetrics: number;
  alertThresholds: {
    slowQueryMs: number;
    errorRatePercent: number;
    highFrequencyPerMinute: number;
  };
  autoOptimize: boolean;
  collectDetailedStats: boolean;
}

export class PerformanceMonitor {
  private readonly STORAGE_KEY = 'performance_metrics';
  private readonly CONFIG_KEY = 'performance_config';
  private readonly ALERTS_KEY = 'performance_alerts';
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private isMonitoring = false;

  private defaultConfig: PerformanceConfig = {
    enabled: true,
    slowQueryThreshold: 100, // 100ms
    maxStoredMetrics: 1000,
    alertThresholds: {
      slowQueryMs: 500,
      errorRatePercent: 5,
      highFrequencyPerMinute: 100
    },
    autoOptimize: false,
    collectDetailedStats: true
  };

  constructor() {
    this.loadMetrics();
    this.loadAlerts();
    this.startMonitoring();
  }

  /**
   * Get current configuration
   */
  getConfig(): PerformanceConfig {
    try {
      const stored = localStorage.getItem(this.CONFIG_KEY);
      return stored ? { ...this.defaultConfig, ...JSON.parse(stored) } : this.defaultConfig;
    } catch (error) {
      console.error('Error loading performance config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PerformanceConfig>): void {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(updated));
    
    if (updated.enabled && !this.isMonitoring) {
      this.startMonitoring();
    } else if (!updated.enabled && this.isMonitoring) {
      this.stopMonitoring();
    }
  }

  /**
   * Start monitoring database operations
   */
  private startMonitoring(): void {
    if (this.isMonitoring) {return;}
    
    const config = this.getConfig();
    if (!config.enabled) {return;}

    this.isMonitoring = true;
    console.log('📊 Performance monitoring started');

    // Intercept IndexedDB operations
    this.interceptIndexedDBOperations();
    
    // Start periodic analysis
    setInterval(() => {
      this.analyzePerformance();
      this.cleanupOldMetrics();
    }, 60000); // Every minute
  }

  /**
   * Stop monitoring
   */
  private stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const config = this.getConfig();
    if (!config.enabled) {return;}

    const fullMetric: PerformanceMetric = {
      ...metric,
      id: `perf-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
      timestamp: new Date()
    };

    this.metrics.push(fullMetric);
    
    // Check for alerts
    this.checkForAlerts(fullMetric);

    // Limit stored metrics
    if (this.metrics.length > config.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-config.maxStoredMetrics);
    }

    this.saveMetrics();
  }

  /**
   * Intercept IndexedDB operations for automatic monitoring
   */
  private interceptIndexedDBOperations(): void {
    // Intercept IDBObjectStore operations
    if (typeof window !== 'undefined' && window.IDBObjectStore) {
      const originalAdd = IDBObjectStore.prototype.add;
      const originalPut = IDBObjectStore.prototype.put;
      const originalGet = IDBObjectStore.prototype.get;
      const originalGetAll = IDBObjectStore.prototype.getAll;
      const originalDelete = IDBObjectStore.prototype.delete;

      IDBObjectStore.prototype.add = function(...args) {
        const startTime = performance.now();
        const result = originalAdd.apply(this, args);
        
        if (result instanceof IDBRequest) {
          result.addEventListener('success', () => {
            const duration = performance.now() - startTime;
            performanceMonitor.recordMetric({
              operation: 'add',
              database: 'unknown',
              table: this.name,
              duration,
              queryType: 'INSERT',
              success: true
            });
          });

          result.addEventListener('error', () => {
            const duration = performance.now() - startTime;
            performanceMonitor.recordMetric({
              operation: 'add',
              database: 'unknown',
              table: this.name,
              duration,
              queryType: 'INSERT',
              success: false,
              ...(result.error?.message ? { errorMessage: result.error.message } : {})
            });
          });
        }
        
        return result;
      };

      IDBObjectStore.prototype.get = function(...args) {
        const startTime = performance.now();
        const result = originalGet.apply(this, args);
        
        if (result instanceof IDBRequest) {
          result.addEventListener('success', () => {
            const duration = performance.now() - startTime;
            performanceMonitor.recordMetric({
              operation: 'get',
              database: 'unknown',
              table: this.name,
              duration,
              queryType: 'SELECT',
              success: true,
              recordCount: result.result ? 1 : 0
            });
          });

          result.addEventListener('error', () => {
            const duration = performance.now() - startTime;
            performanceMonitor.recordMetric({
              operation: 'get',
              database: 'unknown',
              table: this.name,
              duration,
              queryType: 'SELECT',
              success: false,
              ...(result.error?.message ? { errorMessage: result.error.message } : {})
            });
          });
        }
        
        return result;
      };

      IDBObjectStore.prototype.getAll = function(...args) {
        const startTime = performance.now();
        const result = originalGetAll.apply(this, args);
        
        if (result instanceof IDBRequest) {
          result.addEventListener('success', () => {
            const duration = performance.now() - startTime;
            const recordCount = Array.isArray(result.result) ? result.result.length : 0;
            performanceMonitor.recordMetric({
              operation: 'getAll',
              database: 'unknown',
              table: this.name,
              duration,
              queryType: 'SELECT',
              success: true,
              recordCount
            });
          });

          result.addEventListener('error', () => {
            const duration = performance.now() - startTime;
            performanceMonitor.recordMetric({
              operation: 'getAll',
              database: 'unknown',
              table: this.name,
              duration,
              queryType: 'SELECT',
              success: false,
              ...(result.error?.message ? { errorMessage: result.error.message } : {})
            });
          });
        }
        
        return result;
      };
    }
  }

  /**
   * Measure execution time of a function
   */
  async measureOperation<T>(
    operation: string,
    database: string,
    table: string,
    queryType: PerformanceMetric['queryType'],
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    let success = true;
    let errorMessage: string | undefined;
    let result: T;

    try {
      result = await fn();
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const duration = performance.now() - startTime;
      this.recordMetric({
        operation,
        database,
        table,
        duration,
        queryType,
        success,
        ...(errorMessage !== undefined ? { errorMessage } : {})
      });
    }

    return result!;
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentMetrics = this.metrics.filter(m => m.timestamp >= oneDayAgo);
    const weekMetrics = this.metrics.filter(m => m.timestamp >= oneWeekAgo);

    const config = this.getConfig();
    const slowQueries = recentMetrics.filter(m => m.duration > config.slowQueryThreshold);
    const fastQueries = recentMetrics.filter(m => m.duration <= 50).slice(-10);

    // Query type distribution
    const queryTypeDistribution: Record<string, number> = {};
    recentMetrics.forEach(m => {
      queryTypeDistribution[m.queryType] = (queryTypeDistribution[m.queryType] || 0) + 1;
    });

    // Database stats
    const databaseStats: Record<string, { queryCount: number; totalTime: number; avgTime: number }> = {};
    recentMetrics.forEach(m => {
      const entry = databaseStats[m.database] ?? (databaseStats[m.database] = { queryCount: 0, totalTime: 0, avgTime: 0 });
      entry.queryCount++;
      entry.totalTime += m.duration;
      entry.avgTime = entry.totalTime / entry.queryCount;
    });

    // Table stats
    const tableStats: Record<string, { queryCount: number; totalTime: number; avgTime: number }> = {};
    recentMetrics.forEach(m => {
      const entry = tableStats[m.table] ?? (tableStats[m.table] = { queryCount: 0, totalTime: 0, avgTime: 0 });
      entry.queryCount++;
      entry.totalTime += m.duration;
      entry.avgTime = entry.totalTime / entry.queryCount;
    });

    // Hourly stats
    const hourlyStats = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourMetrics = recentMetrics.filter(m => 
        m.timestamp >= hourStart && m.timestamp < hourEnd
      );

      hourlyStats.push({
        hour: hourStart.getHours().toString().padStart(2, '0') + ':00',
        queryCount: hourMetrics.length,
        avgTime: hourMetrics.length ? hourMetrics.reduce((sum, m) => sum + m.duration, 0) / hourMetrics.length : 0
      });
    }

    // Performance trends
    const thisWeekAvg = recentMetrics.length ? 
      recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length : 0;
    const lastWeekAvg = weekMetrics.length ? 
      weekMetrics.reduce((sum, m) => sum + m.duration, 0) / weekMetrics.length : 0;
    
    const improvementSinceLastWeek = lastWeekAvg ? ((lastWeekAvg - thisWeekAvg) / lastWeekAvg) * 100 : 0;

    // Slowest operations
    const operationStats: Record<string, { totalTime: number, count: number }> = {};
    weekMetrics.forEach(m => {
      const key = `${m.operation}:${m.table}`;
      if (!operationStats[key]) {
        operationStats[key] = { totalTime: 0, count: 0 };
      }
      operationStats[key].totalTime += m.duration;
      operationStats[key].count++;
    });

    const slowestOperations = Object.entries(operationStats)
      .map(([operation, stats]) => ({
        operation,
        avgTime: stats.totalTime / stats.count,
        frequency: stats.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    return {
      totalQueries: recentMetrics.length,
      averageQueryTime: recentMetrics.length ? 
        recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length : 0,
      slowQueries: slowQueries.slice(-10),
      fastQueries,
      queryTypeDistribution,
      databaseStats,
      tableStats,
      hourlyStats,
      performanceTrends: {
        improvementSinceLastWeek,
        slowestOperations
      }
    };
  }

  /**
   * Check for performance alerts
   */
  private checkForAlerts(metric: PerformanceMetric): void {
    const config = this.getConfig();
    
    // Slow query alert
    if (metric.duration > config.alertThresholds.slowQueryMs) {
      this.createAlert({
        type: 'SLOW_QUERY',
        severity: metric.duration > 1000 ? 'CRITICAL' : 'HIGH',
        message: `Slow query detected: ${metric.operation} on ${metric.table}`,
        details: `Query took ${metric.duration.toFixed(2)}ms, which is above the ${config.alertThresholds.slowQueryMs}ms threshold`,
        recommendations: [
          'Consider adding indexes to the table',
          'Optimize the query logic',
          'Check for large dataset operations',
          'Consider data archiving if dataset is too large'
        ]
      });
    }

    // Error rate checking (check recent error rate)
    const recentMetrics = this.metrics.filter(m => 
      m.timestamp.getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
    );
    const errorCount = recentMetrics.filter(m => !m.success).length;
    const errorRate = recentMetrics.length ? (errorCount / recentMetrics.length) * 100 : 0;

    if (errorRate > config.alertThresholds.errorRatePercent && recentMetrics.length > 10) {
      this.createAlert({
        type: 'ERROR_RATE',
        severity: errorRate > 20 ? 'CRITICAL' : 'HIGH',
        message: `High error rate detected: ${errorRate.toFixed(1)}%`,
        details: `${errorCount} errors out of ${recentMetrics.length} operations in the last 5 minutes`,
        recommendations: [
          'Check database connectivity',
          'Verify data integrity',
          'Review recent code changes',
          'Check for IndexedDB quota issues'
        ]
      });
    }
  }

  /**
   * Create a performance alert
   */
  private createAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const fullAlert: PerformanceAlert = {
      ...alert,
      id: `alert-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`,
      timestamp: new Date(),
      resolved: false
    };

    // Avoid duplicate alerts
    const isDuplicate = this.alerts.some(existing => 
      existing.type === alert.type && 
      existing.message === alert.message &&
      !existing.resolved &&
      existing.timestamp.getTime() > Date.now() - 10 * 60 * 1000 // Within last 10 minutes
    );

    if (!isDuplicate) {
      this.alerts.push(fullAlert);
      console.warn('🚨 Performance Alert:', fullAlert);
      this.saveAlerts();
    }
  }

  /**
   * Get all alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.saveAlerts();
    }
  }

  /**
   * Clear all resolved alerts
   */
  clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter(a => !a.resolved);
    this.saveAlerts();
  }

  /**
   * Analyze performance and provide recommendations
   */
  private analyzePerformance(): void {
    const stats = this.getStats();
    
    // Auto-optimization suggestions
    if (stats.slowQueries.length > 5) {
      console.log('💡 Performance suggestion: Consider running index optimization');
    }

    if (stats.totalQueries > 1000) {
      console.log('💡 Performance suggestion: Consider data archiving for old records');
    }
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const stats = this.getStats();
    const recommendations: string[] = [];

    if (stats.averageQueryTime > 100) {
      recommendations.push('Average query time is high. Consider index optimization.');
    }

    if (stats.slowQueries.length > 10) {
      recommendations.push('Multiple slow queries detected. Run database optimization.');
    }

    if (stats.totalQueries > 500) {
      recommendations.push('High query volume. Consider implementing data archiving.');
    }

    const errorRate = stats.totalQueries ? 
      (this.metrics.filter(m => !m.success).length / this.metrics.length) * 100 : 0;
    
    if (errorRate > 5) {
      recommendations.push('High error rate detected. Check database connectivity and integrity.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Database performance is optimal. No immediate action required.');
    }

    return recommendations;
  }

  /**
   * Export performance data for analysis
   */
  exportData(): string {
    return JSON.stringify({
      metrics: this.metrics,
      stats: this.getStats(),
      alerts: this.alerts,
      config: this.getConfig(),
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Load metrics from storage
   */
  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as unknown;
        this.metrics = (Array.isArray(data) ? data : []).map((m) => {
          const raw = m as Partial<PerformanceMetric> & { timestamp: string | number | Date };
          return { ...(raw as PerformanceMetric), timestamp: new Date(raw.timestamp) };
        });
      }
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      this.metrics = [];
    }
  }

  /**
   * Save metrics to storage
   */
  private saveMetrics(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Error saving performance metrics:', error);
    }
  }

  /**
   * Load alerts from storage
   */
  private loadAlerts(): void {
    try {
      const stored = localStorage.getItem(this.ALERTS_KEY);
      if (stored) {
        const data = JSON.parse(stored) as unknown;
        this.alerts = (Array.isArray(data) ? data : []).map((a) => {
          const raw = a as Partial<PerformanceAlert> & { timestamp: string | number | Date };
          return { ...(raw as PerformanceAlert), timestamp: new Date(raw.timestamp) };
        });
      }
    } catch (error) {
      console.error('Error loading performance alerts:', error);
      this.alerts = [];
    }
  }

  /**
   * Save alerts to storage
   */
  private saveAlerts(): void {
    try {
      localStorage.setItem(this.ALERTS_KEY, JSON.stringify(this.alerts));
    } catch (error) {
      console.error('Error saving performance alerts:', error);
    }
  }

  /**
   * Clean up old metrics to prevent storage bloat
   */
  private cleanupOldMetrics(): void {
    const config = this.getConfig();
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffDate);
    this.alerts = this.alerts.filter(a => a.timestamp >= cutoffDate);
    
    // Limit total stored metrics
    if (this.metrics.length > config.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-config.maxStoredMetrics);
    }

    this.saveMetrics();
    this.saveAlerts();
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();