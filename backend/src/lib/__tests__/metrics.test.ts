import { describe, it, expect, beforeEach } from 'vitest';
import { metrics, MetricNames } from '../metrics';

describe('Metrics', () => {
  beforeEach(() => {
    metrics.clear();
  });

  it('should record counter metrics', () => {
    metrics.counter('test.counter', 5, { source: 'test' });

    const recorded = metrics.getMetrics({ name: 'test.counter' });
    expect(recorded).toHaveLength(1);
    expect(recorded[0]).toMatchObject({
      name: 'test.counter',
      type: 'counter',
      value: 5,
      labels: { source: 'test' },
    });
  });

  it('should record gauge metrics', () => {
    metrics.gauge('test.gauge', 42.5);

    const recorded = metrics.getMetrics({ name: 'test.gauge' });
    expect(recorded).toHaveLength(1);
    expect(recorded[0].value).toBe(42.5);
    expect(recorded[0].type).toBe('gauge');
  });

  it('should record histogram metrics', () => {
    metrics.histogram('test.histogram', 100);
    metrics.histogram('test.histogram', 200);
    metrics.histogram('test.histogram', 150);

    const recorded = metrics.getMetrics({ name: 'test.histogram' });
    expect(recorded).toHaveLength(3);
  });

  it('should measure timers', () => {
    const timer = metrics.timer('test.timer');

    // Simulate some work
    const start = Date.now();
    while (Date.now() - start < 10) {
      // busy wait
    }

    const duration = timer.stop();

    expect(duration).toBeGreaterThanOrEqual(10);

    const recorded = metrics.getMetrics({ name: 'test.timer' });
    expect(recorded).toHaveLength(1);
    expect(recorded[0].value).toBeGreaterThanOrEqual(10);
  });

  it('should filter metrics by name', () => {
    metrics.counter('metric.a', 1);
    metrics.counter('metric.b', 2);
    metrics.counter('metric.a', 3);

    const metricsA = metrics.getMetrics({ name: 'metric.a' });
    expect(metricsA).toHaveLength(2);
    expect(metricsA.every((m) => m.name === 'metric.a')).toBe(true);
  });

  it('should filter metrics by type', () => {
    metrics.counter('test.counter', 1);
    metrics.gauge('test.gauge', 2);
    metrics.histogram('test.histogram', 3);

    const counters = metrics.getMetrics({ type: 'counter' });
    const gauges = metrics.getMetrics({ type: 'gauge' });

    expect(counters.every((m) => m.type === 'counter')).toBe(true);
    expect(gauges.every((m) => m.type === 'gauge')).toBe(true);
  });

  it('should calculate aggregated metrics', () => {
    metrics.histogram('response.time', 100);
    metrics.histogram('response.time', 200);
    metrics.histogram('response.time', 150);
    metrics.histogram('response.time', 250);

    const agg = metrics.getAggregated('response.time');

    expect(agg.count).toBe(4);
    expect(agg.sum).toBe(700);
    expect(agg.avg).toBe(175);
    expect(agg.min).toBe(100);
    expect(agg.max).toBe(250);
  });

  it('should limit stored metrics', () => {
    // Record more than max
    for (let i = 0; i < 12000; i++) {
      metrics.counter('test.counter', 1);
    }

    const all = metrics.getMetrics();
    expect(all.length).toBeLessThanOrEqual(10000);
  });

  it('should use predefined metric names', () => {
    metrics.counter(MetricNames.HTTP_REQUEST_COUNT, 1);
    metrics.histogram(MetricNames.HTTP_REQUEST_DURATION, 150);
    metrics.counter(MetricNames.LLM_TOKEN_COUNT, 500);

    const httpRequests = metrics.getMetrics({ name: MetricNames.HTTP_REQUEST_COUNT });
    const llmTokens = metrics.getMetrics({ name: MetricNames.LLM_TOKEN_COUNT });

    expect(httpRequests).toHaveLength(1);
    expect(llmTokens).toHaveLength(1);
  });
});
