// Metrics Collection System
// Provides instrumentation for observability

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timer';

export interface MetricLabels {
  [key: string]: string | number;
}

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: MetricLabels;
  timestamp: Date;
}

export interface TimerResult {
  durationMs: number;
  stop: () => number;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private maxStoredMetrics = 10000; // Keep last 10k metrics in memory

  /**
   * Record a counter metric (cumulative value)
   */
  counter(name: string, value: number = 1, labels?: MetricLabels): void {
    this.record({
      name,
      type: 'counter',
      value,
      labels,
      timestamp: new Date(),
    });
  }

  /**
   * Record a gauge metric (point-in-time value)
   */
  gauge(name: string, value: number, labels?: MetricLabels): void {
    this.record({
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: new Date(),
    });
  }

  /**
   * Record a histogram metric (distribution of values)
   */
  histogram(name: string, value: number, labels?: MetricLabels): void {
    this.record({
      name,
      type: 'histogram',
      value,
      labels,
      timestamp: new Date(),
    });
  }

  /**
   * Start a timer and return a function to stop it
   */
  timer(name: string, labels?: MetricLabels): TimerResult {
    const startTime = Date.now();

    const stop = (): number => {
      const durationMs = Date.now() - startTime;
      this.record({
        name,
        type: 'timer',
        value: durationMs,
        labels,
        timestamp: new Date(),
      });
      return durationMs;
    };

    return {
      durationMs: 0, // Will be calculated on stop
      stop,
    };
  }

  /**
   * Record a metric
   */
  private record(metric: Metric): void {
    this.metrics.push(metric);

    // Trim if exceeds max
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-this.maxStoredMetrics);
    }

    // In production, this would send to a metrics backend
    // For now, just log significant metrics
    if (process.env.NODE_ENV === 'development') {
      console.debug('[METRIC]', metric.name, metric.value, metric.labels);
    }
  }

  /**
   * Get all metrics (for testing/debugging)
   */
  getMetrics(filter?: { name?: string; type?: MetricType }): Metric[] {
    if (!filter) {
      return [...this.metrics];
    }

    return this.metrics.filter((metric) => {
      if (filter.name && metric.name !== filter.name) return false;
      if (filter.type && metric.type !== filter.type) return false;
      return true;
    });
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get aggregated metrics for reporting
   */
  getAggregated(name: string, since?: Date): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  } {
    const filtered = this.metrics.filter((m) => {
      if (m.name !== name) return false;
      if (since && m.timestamp < since) return false;
      return true;
    });

    if (filtered.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    }

    const values = filtered.map((m) => m.value);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: filtered.length,
      sum,
      avg: sum / filtered.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Predefined metric names for consistency
export const MetricNames = {
  // HTTP metrics
  HTTP_REQUEST_DURATION: 'http.request.duration_ms',
  HTTP_REQUEST_COUNT: 'http.request.count',
  HTTP_ERROR_COUNT: 'http.error.count',

  // Database metrics
  DB_QUERY_DURATION: 'db.query.duration_ms',
  DB_CONNECTION_COUNT: 'db.connection.count',

  // LLM metrics
  LLM_REQUEST_DURATION: 'llm.request.duration_ms',
  LLM_TOKEN_COUNT: 'llm.token.count',
  LLM_COST: 'llm.cost',
  LLM_ERROR_COUNT: 'llm.error.count',

  // Benchmark metrics
  BENCHMARK_RUN_DURATION: 'benchmark.run.duration_ms',
  BENCHMARK_TASK_DURATION: 'benchmark.task.duration_ms',
  BENCHMARK_SCORE: 'benchmark.score',

  // Business metrics
  SUITE_CREATED: 'suite.created',
  AGENT_CREATED: 'agent.created',
  RUN_CREATED: 'run.created',
  RUN_COMPLETED: 'run.completed',
};
