import { describe, it, expect } from 'vitest';
import { ScoringService } from '../scoring.service';

describe('ScoringService', () => {
  const scoringService = new ScoringService();

  describe('exact match scoring', () => {
    it('should return true for identical strings', async () => {
      const result = await scoringService.score('hello', 'hello');
      expect(result.exactMatch).toBe(true);
    });

    it('should return false for different strings', async () => {
      const result = await scoringService.score('hello', 'world');
      expect(result.exactMatch).toBe(false);
    });

    it('should handle trimming whitespace', async () => {
      const result = await scoringService.score('  hello  ', 'hello');
      expect(result.exactMatch).toBe(true);
    });

    it('should handle JSON objects', async () => {
      const obj1 = { name: 'test', value: 123 };
      const obj2 = { name: 'test', value: 123 };
      const result = await scoringService.score(obj1, obj2);
      expect(result.exactMatch).toBe(true);
    });
  });

  describe('similarity scoring', () => {
    it('should return 1.0 for identical strings', async () => {
      const result = await scoringService.score('hello world', 'hello world');
      expect(result.similarity).toBe(1.0);
    });

    it('should return > 0 for partially matching strings', async () => {
      const result = await scoringService.score('hello world', 'hello universe');
      expect(result.similarity).toBeGreaterThan(0);
      expect(result.similarity).toBeLessThan(1);
    });

    it('should return 0 for completely different strings', async () => {
      const result = await scoringService.score('abc', 'xyz');
      expect(result.similarity).toBe(0);
    });

    it('should handle case-insensitive comparison', async () => {
      const result = await scoringService.score('HELLO', 'hello');
      expect(result.similarity).toBe(1.0);
    });
  });

  describe('without expected output', () => {
    it('should not compute exact match or similarity without expected output', async () => {
      const result = await scoringService.score('hello');
      expect(result.exactMatch).toBeUndefined();
      expect(result.similarity).toBeUndefined();
    });
  });
});
