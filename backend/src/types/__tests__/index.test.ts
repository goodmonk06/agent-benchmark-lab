import { describe, it, expect } from 'vitest';
import {
  TaskDomain,
  LLMProvider,
  RunStatus,
  CreateTaskSuiteSchema,
  CreateAgentProfileSchema,
  CreateBenchmarkRunSchema,
} from '../index';

describe('Type Validation', () => {
  describe('TaskDomain', () => {
    it('should accept valid domains', () => {
      expect(() => TaskDomain.parse('code')).not.toThrow();
      expect(() => TaskDomain.parse('writing')).not.toThrow();
      expect(() => TaskDomain.parse('planning')).not.toThrow();
      expect(() => TaskDomain.parse('qa')).not.toThrow();
    });

    it('should reject invalid domains', () => {
      expect(() => TaskDomain.parse('invalid')).toThrow();
    });
  });

  describe('LLMProvider', () => {
    it('should accept valid providers', () => {
      expect(() => LLMProvider.parse('openai')).not.toThrow();
      expect(() => LLMProvider.parse('anthropic')).not.toThrow();
    });

    it('should reject invalid providers', () => {
      expect(() => LLMProvider.parse('google')).toThrow();
    });
  });

  describe('CreateTaskSuiteSchema', () => {
    it('should validate correct task suite data', () => {
      const validData = {
        name: 'Test Suite',
        description: 'A test suite',
        domain: 'code',
      };
      expect(() => CreateTaskSuiteSchema.parse(validData)).not.toThrow();
    });

    it('should require name field', () => {
      const invalidData = {
        domain: 'code',
      };
      expect(() => CreateTaskSuiteSchema.parse(invalidData)).toThrow();
    });

    it('should require valid domain', () => {
      const invalidData = {
        name: 'Test Suite',
        domain: 'invalid',
      };
      expect(() => CreateTaskSuiteSchema.parse(invalidData)).toThrow();
    });
  });

  describe('CreateAgentProfileSchema', () => {
    it('should validate correct agent profile data', () => {
      const validData = {
        name: 'Test Agent',
        model: 'gpt-4',
        provider: 'openai',
        systemPrompt: 'You are a helpful assistant',
      };
      expect(() => CreateAgentProfileSchema.parse(validData)).not.toThrow();
    });

    it('should default toolsJson to empty array', () => {
      const data = {
        name: 'Test Agent',
        model: 'gpt-4',
        provider: 'openai',
        systemPrompt: 'You are a helpful assistant',
      };
      const result = CreateAgentProfileSchema.parse(data);
      expect(result.toolsJson).toEqual([]);
    });

    it('should require all mandatory fields', () => {
      const invalidData = {
        name: 'Test Agent',
      };
      expect(() => CreateAgentProfileSchema.parse(invalidData)).toThrow();
    });
  });

  describe('CreateBenchmarkRunSchema', () => {
    it('should validate correct benchmark run data', () => {
      const validData = {
        suiteId: 'suite-123',
        agentProfileIds: ['agent-1', 'agent-2'],
      };
      expect(() => CreateBenchmarkRunSchema.parse(validData)).not.toThrow();
    });

    it('should require at least one agent', () => {
      const invalidData = {
        suiteId: 'suite-123',
        agentProfileIds: [],
      };
      expect(() => CreateBenchmarkRunSchema.parse(invalidData)).toThrow();
    });

    it('should require suiteId', () => {
      const invalidData = {
        agentProfileIds: ['agent-1'],
      };
      expect(() => CreateBenchmarkRunSchema.parse(invalidData)).toThrow();
    });
  });
});
