import { describe, it, expect } from 'vitest';
import {
  ExactMatchStrategy,
  SimilarityStrategy,
  RegexMatchStrategy,
  scoringStrategyRegistry,
} from '../scoring-strategy.adapter';

describe('ExactMatchStrategy', () => {
  const strategy = new ExactMatchStrategy();

  it('should score exact matches as 100', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: 'hello world',
      expected: 'hello world',
    });

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.details.exactMatch).toBe(true);
  });

  it('should score non-matches as 0', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: 'hello world',
      expected: 'goodbye world',
    });

    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('should normalize whitespace', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: '  hello world  ',
      expected: 'hello world',
    });

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('should handle JSON objects', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: { name: 'test', value: 123 },
      expected: { name: 'test', value: 123 },
    });

    expect(result.score).toBe(100);
  });
});

describe('SimilarityStrategy', () => {
  const strategy = new SimilarityStrategy();

  it('should score identical strings as 100', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: 'hello world',
      expected: 'hello world',
    });

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('should score partial matches between 0 and 100', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: 'hello world',
      expected: 'hello universe',
    });

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  it('should respect custom threshold', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: 'hello world',
      expected: 'hello universe',
      config: { threshold: 0.9 },
    });

    expect(result.passed).toBe(false); // Because similarity < 0.9
  });

  it('should provide confidence score', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: 'hello world',
      expected: 'hello world test',
    });

    expect(result.confidence).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});

describe('RegexMatchStrategy', () => {
  const strategy = new RegexMatchStrategy();

  it('should match patterns', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: 'hello world 123',
      config: {
        pattern: '\\d+',
      },
    });

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('should fail on non-matches', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: 'hello world',
      config: {
        pattern: '\\d+',
      },
    });

    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('should support regex flags', async () => {
    const result = await strategy.score({
      taskId: '1',
      agentId: '1',
      input: 'test',
      output: 'HELLO WORLD',
      config: {
        pattern: 'hello',
        flags: 'i',
      },
    });

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('should validate config', () => {
    expect(strategy.validateConfig({ pattern: 'test' })).toBe(true);
    expect(strategy.validateConfig({})).toBe(false);
    expect(strategy.validateConfig({ pattern: 123 })).toBe(false);
  });
});

describe('ScoringStrategyRegistry', () => {
  it('should have built-in strategies registered', () => {
    expect(scoringStrategyRegistry.has('exact_match')).toBe(true);
    expect(scoringStrategyRegistry.has('similarity')).toBe(true);
    expect(scoringStrategyRegistry.has('regex_match')).toBe(true);
  });

  it('should retrieve strategies by name', () => {
    const strategy = scoringStrategyRegistry.get('exact_match');
    expect(strategy).toBeInstanceOf(ExactMatchStrategy);
  });

  it('should list all strategies', () => {
    const all = scoringStrategyRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(3);
  });
});
