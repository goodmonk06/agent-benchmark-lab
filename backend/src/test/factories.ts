// Test Data Factories
// Provides convenient builders for test data

import type { Prisma } from '@prisma/client';

let counter = 0;
const getId = () => `test-${Date.now()}-${counter++}`;

export const factories = {
  organization: {
    build: (overrides?: Partial<Prisma.OrganizationCreateInput>): Prisma.OrganizationCreateInput => ({
      id: getId(),
      name: `Test Org ${counter}`,
      slug: `test-org-${counter}`,
      description: 'Test organization',
      settings: {},
      ...overrides,
    }),
  },

  user: {
    build: (overrides?: Partial<Prisma.UserCreateInput>): Prisma.UserCreateInput => ({
      id: getId(),
      email: `user${counter}@test.com`,
      name: `Test User ${counter}`,
      role: 'member',
      organization: {
        connect: { id: overrides?.organization?.connect?.id || 'default-org' },
      },
      ...overrides,
    }),
  },

  taskSuite: {
    build: (overrides?: Partial<Prisma.TaskSuiteCreateInput>): Prisma.TaskSuiteCreateInput => ({
      id: getId(),
      name: `Test Suite ${counter}`,
      description: 'Test suite description',
      domain: 'code',
      visibility: 'private',
      isTemplate: false,
      metadata: {},
      ...overrides,
    }),
  },

  taskItem: {
    build: (overrides?: Partial<Prisma.TaskItemCreateInput>): Prisma.TaskItemCreateInput => ({
      id: getId(),
      suite: {
        connect: { id: overrides?.suite?.connect?.id || 'default-suite' },
      },
      name: `Test Task ${counter}`,
      description: 'Test task description',
      difficulty: 'medium',
      inputJson: {
        prompt: 'Test prompt',
      },
      expectedJson: 'Expected output',
      scoringConfigJson: {
        useSimilarity: true,
      },
      ...overrides,
    }),
  },

  agentProfile: {
    build: (overrides?: Partial<Prisma.AgentProfileCreateInput>): Prisma.AgentProfileCreateInput => ({
      id: getId(),
      name: `Test Agent ${counter}`,
      description: 'Test agent description',
      model: 'gpt-4',
      provider: 'openai',
      systemPrompt: 'You are a helpful assistant.',
      toolsJson: [],
      temperature: 0.7,
      maxTokens: 1000,
      isActive: true,
      isTemplate: false,
      metadata: {},
      ...overrides,
    }),
  },

  benchmarkRun: {
    build: (overrides?: Partial<Prisma.BenchmarkRunCreateInput>): Prisma.BenchmarkRunCreateInput => ({
      id: getId(),
      suite: {
        connect: { id: overrides?.suite?.connect?.id || 'default-suite' },
      },
      name: `Test Run ${counter}`,
      status: 'pending',
      priority: 'normal',
      notifyOnComplete: false,
      webhookIds: [],
      metadata: {},
      ...overrides,
    }),
  },

  benchmarkRunAgent: {
    build: (
      overrides?: Partial<Prisma.BenchmarkRunAgentCreateInput>
    ): Prisma.BenchmarkRunAgentCreateInput => ({
      id: getId(),
      run: {
        connect: { id: overrides?.run?.connect?.id || 'default-run' },
      },
      agentProfile: {
        connect: { id: overrides?.agentProfile?.connect?.id || 'default-agent' },
      },
      status: 'pending',
      metricsJson: null,
      ...overrides,
    }),
  },

  benchmarkResult: {
    build: (
      overrides?: Partial<Prisma.BenchmarkResultCreateInput>
    ): Prisma.BenchmarkResultCreateInput => ({
      id: getId(),
      runAgent: {
        connect: { id: overrides?.runAgent?.connect?.id || 'default-runagent' },
      },
      taskItem: {
        connect: { id: overrides?.taskItem?.connect?.id || 'default-task' },
      },
      outputJson: 'Test output',
      scoreJson: {
        exactMatch: false,
        similarity: 0.75,
      },
      durationMs: 1000,
      tokensUsed: 500,
      promptTokens: 300,
      completionTokens: 200,
      estimatedCost: 0.005,
      retryCount: 0,
      metadata: {},
      ...overrides,
    }),
  },

  tag: {
    build: (overrides?: Partial<Prisma.TagCreateInput>): Prisma.TagCreateInput => ({
      id: getId(),
      name: `test-tag-${counter}`,
      color: '#3B82F6',
      ...overrides,
    }),
  },

  webhook: {
    build: (overrides?: Partial<Prisma.WebhookCreateInput>): Prisma.WebhookCreateInput => ({
      id: getId(),
      organization: {
        connect: { id: overrides?.organization?.connect?.id || 'default-org' },
      },
      name: `Test Webhook ${counter}`,
      url: `https://example.com/webhook-${counter}`,
      events: ['run.completed'],
      isActive: true,
      failureCount: 0,
      headers: {},
      ...overrides,
    }),
  },

  comment: {
    build: (overrides?: Partial<Prisma.CommentCreateInput>): Prisma.CommentCreateInput => ({
      id: getId(),
      content: `Test comment ${counter}`,
      user: {
        connect: { id: overrides?.user?.connect?.id || 'default-user' },
      },
      metadata: {},
      ...overrides,
    }),
  },
};

// Helper to reset counter (useful between tests)
export function resetFactoryCounter() {
  counter = 0;
}
