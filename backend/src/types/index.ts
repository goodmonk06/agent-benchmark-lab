import { z } from 'zod';

// Domain enums
export const TaskDomain = z.enum(['code', 'writing', 'planning', 'qa', 'reasoning', 'general']);
export type TaskDomain = z.infer<typeof TaskDomain>;

export const LLMProvider = z.enum(['openai', 'anthropic']);
export type LLMProvider = z.infer<typeof LLMProvider>;

export const RunStatus = z.enum(['pending', 'running', 'completed', 'failed']);
export type RunStatus = z.infer<typeof RunStatus>;

// Request/Response schemas
export const CreateTaskSuiteSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  domain: TaskDomain,
});
export type CreateTaskSuiteInput = z.infer<typeof CreateTaskSuiteSchema>;

export const CreateTaskItemSchema = z.object({
  suiteId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  inputJson: z.any(),
  expectedJson: z.any().optional(),
  scoringConfigJson: z.any().optional(),
});
export type CreateTaskItemInput = z.infer<typeof CreateTaskItemSchema>;

export const CreateAgentProfileSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  model: z.string().min(1),
  provider: LLMProvider,
  systemPrompt: z.string().min(1),
  toolsJson: z.array(z.string()).default([]),
});
export type CreateAgentProfileInput = z.infer<typeof CreateAgentProfileSchema>;

export const CreateBenchmarkRunSchema = z.object({
  suiteId: z.string(),
  name: z.string().optional(),
  agentProfileIds: z.array(z.string()).min(1),
});
export type CreateBenchmarkRunInput = z.infer<typeof CreateBenchmarkRunSchema>;

// LLM Response types
export interface LLMResponse {
  content: string;
  tokensUsed?: number;
  durationMs: number;
}

// Scoring types
export interface ScoreResult {
  exactMatch?: boolean;
  similarity?: number;
  llmJudgeScore?: number;
  llmJudgeReasoning?: string;
  customScores?: Record<string, any>;
}
