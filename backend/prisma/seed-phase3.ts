import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Phase 3 seed...');

  // Clean all data (in dependency order)
  await prisma.webhookDelivery.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.costTracking.deleteMany();
  await prisma.benchmarkResult.deleteMany();
  await prisma.benchmarkRunAgent.deleteMany();
  await prisma.benchmarkRun.deleteMany();
  await prisma.scheduledRun.deleteMany();
  await prisma.runTemplate.deleteMany();
  await prisma.agentProfile.deleteMany();
  await prisma.taskItem.deleteMany();
  await prisma.taskSuite.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('✨ Cleaned existing data');

  // Create Organizations
  const acmeCorp = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      description: 'Leading AI research organization',
      settings: { theme: 'dark', notifications: true },
    },
  });

  const betaLabs = await prisma.organization.create({
    data: {
      name: 'Beta Labs',
      slug: 'beta-labs',
      description: 'Innovation-focused startup',
      settings: { theme: 'light', notifications: false },
    },
  });

  console.log('✨ Created 2 organizations');

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      name: 'Alice Admin',
      role: 'admin',
      organizationId: acmeCorp.id,
      metadata: { department: 'Engineering', title: 'Principal Engineer' },
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'bob@acme.com',
      name: 'Bob Builder',
      role: 'member',
      organizationId: acmeCorp.id,
      metadata: { department: 'AI Research', title: 'ML Engineer' },
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@beta.com',
      name: 'Charlie Viewer',
      role: 'viewer',
      organizationId: betaLabs.id,
      metadata: { department: 'Product', title: 'Product Manager' },
    },
  });

  console.log('✨ Created 3 users');

  // Create Tags
  const productionTag = await prisma.tag.create({
    data: { name: 'production', color: '#EF4444' },
  });

  const experimentalTag = await prisma.tag.create({
    data: { name: 'experimental', color: '#F59E0B' },
  });

  const baselineTag = await prisma.tag.create({
    data: { name: 'baseline', color: '#10B981' },
  });

  console.log('✨ Created 3 tags');

  // Create comprehensive task suites
  const codeAdvancedSuite = await prisma.taskSuite.create({
    data: {
      name: 'Advanced Code Generation',
      description: 'Complex coding challenges for senior-level assessment',
      domain: 'code',
      organizationId: acmeCorp.id,
      createdById: adminUser.id,
      visibility: 'organization',
      isTemplate: true,
      metadata: { difficulty: 'hard', language: 'python' },
    },
  });

  const reasoningSuite = await prisma.taskSuite.create({
    data: {
      name: 'Logical Reasoning',
      description: 'Test analytical and logical thinking capabilities',
      domain: 'reasoning',
      organizationId: acmeCorp.id,
      createdById: memberUser.id,
      visibility: 'private',
      isTemplate: false,
      metadata: { focus: 'problem-solving' },
    },
  });

  const qaSuite = await prisma.taskSuite.create({
    data: {
      name: 'QA Test Generation',
      description: 'Generate comprehensive test cases and scenarios',
      domain: 'qa',
      organizationId: betaLabs.id,
      createdById: viewerUser.id,
      visibility: 'public',
      isTemplate: true,
      metadata: { testingType: 'integration' },
    },
  });

  console.log('✨ Created 3 task suites');

  // Create tasks for each suite (20+ tasks total)
  const codeTasksData = [
    {
      suiteId: codeAdvancedSuite.id,
      name: 'Implement Binary Search Tree',
      description: 'Create a complete BST with insert, delete, and search',
      difficulty: 'hard',
      category: 'data-structures',
      version: 1,
      order: 1,
      inputJson: { prompt: 'Implement a binary search tree in Python with full CRUD operations' },
      expectedJson: null,
      scoringConfigJson: { strategy: 'similarity', threshold: 0.8 },
      metadata: { estimatedTime: 30 },
    },
    {
      suiteId: codeAdvancedSuite.id,
      name: 'Algorithm Optimization',
      description: 'Optimize a slow algorithm',
      difficulty: 'hard',
      category: 'algorithms',
      version: 1,
      order: 2,
      inputJson: { prompt: 'Optimize this O(n²) sorting algorithm to O(n log n)' },
      expectedJson: null,
      scoringConfigJson: { strategy: 'regex', pattern: 'O\\(n log n\\)' },
      metadata: { estimatedTime: 20 },
    },
  ];

  await prisma.taskItem.createMany({ data: codeTasksData });

  const reasoningTasksData = [
    {
      suiteId: reasoningSuite.id,
      name: 'Logic Puzzle',
      description: 'Solve a complex logic puzzle',
      difficulty: 'medium',
      category: 'puzzles',
      version: 1,
      order: 1,
      inputJson: { prompt: 'Five people with different professions. Who is the doctor?' },
      expectedJson: 'The doctor is Charlie',
      scoringConfigJson: { strategy: 'exact_match' },
      metadata: { type: 'deduction' },
    },
  ];

  await prisma.taskItem.createMany({ data: reasoningTasksData });

  const qaTasksData = [
    {
      suiteId: qaSuite.id,
      name: 'API Test Cases',
      description: 'Generate test cases for REST API',
      difficulty: 'medium',
      category: 'api-testing',
      version: 1,
      order: 1,
      inputJson: { prompt: 'Generate comprehensive test cases for a user authentication API' },
      expectedJson: null,
      scoringConfigJson: { strategy: 'similarity', threshold: 0.7 },
      metadata: { coverage: 'comprehensive' },
    },
  ];

  await prisma.taskItem.createMany({ data: qaTasksData });

  console.log('✨ Created tasks for all suites');

  // Create agent profiles with advanced configuration
  const gpt4Optimized = await prisma.agentProfile.create({
    data: {
      name: 'GPT-4 Optimized',
      description: 'Production-ready GPT-4 with optimal settings',
      model: 'gpt-4',
      provider: 'openai',
      systemPrompt: 'You are an expert software engineer. Provide clear, efficient, production-ready code.',
      toolsJson: ['code_interpreter', 'web_search'],
      organizationId: acmeCorp.id,
      createdById: adminUser.id,
      temperature: 0.3,
      maxTokens: 2000,
      timeout: 60000,
      retryPolicy: { maxRetries: 3, initialDelayMs: 1000, maxDelayMs: 10000 },
      costConfig: { promptCostPer1k: 0.03, completionCostPer1k: 0.06 },
      isActive: true,
      isTemplate: false,
      metadata: { version: '1.0', purpose: 'production' },
    },
  });

  const claudeExperimental = await prisma.agentProfile.create({
    data: {
      name: 'Claude 3 Experimental',
      description: 'Experimental Claude setup for testing',
      model: 'claude-3-opus-20240229',
      provider: 'anthropic',
      systemPrompt: 'You are a creative AI assistant. Think outside the box.',
      toolsJson: [],
      organizationId: acmeCorp.id,
      createdById: memberUser.id,
      temperature: 0.9,
      maxTokens: 4000,
      timeout: 90000,
      isActive: true,
      isTemplate: false,
      metadata: { version: '0.1', purpose: 'experiment' },
    },
  });

  console.log('✨ Created 2 agent profiles');

  // Create webhooks
  const webhook1 = await prisma.webhook.create({
    data: {
      organizationId: acmeCorp.id,
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/TEST/WEBHOOK',
      events: ['run.completed', 'run.failed'],
      secret: 'webhook-secret-123',
      headers: { 'X-Custom-Header': 'value' },
      isActive: true,
    },
  });

  console.log('✨ Created webhooks');

  // Create run templates
  const template1 = await prisma.runTemplate.create({
    data: {
      name: 'Quick Code Test',
      description: 'Fast code evaluation template',
      suiteId: codeAdvancedSuite.id,
      agentProfileIds: [gpt4Optimized.id],
      configuration: { priority: 'high', notifyOnComplete: true },
      isPublic: true,
      usageCount: 5,
    },
  });

  console.log('✨ Created run templates');

  // Create a benchmark run with results
  const benchmarkRun = await prisma.benchmarkRun.create({
    data: {
      suiteId: codeAdvancedSuite.id,
      organizationId: acmeCorp.id,
      createdById: adminUser.id,
      name: 'Production Evaluation',
      status: 'completed',
      priority: 'high',
      notifyOnComplete: true,
      webhookIds: [webhook1.id],
      metadata: { purpose: 'production-validation' },
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
      agents: {
        create: [
          {
            agentProfileId: gpt4Optimized.id,
            status: 'completed',
            metricsJson: {
              totalTasks: 2,
              successfulTasks: 2,
              failedTasks: 0,
              averageScore: 95.5,
              totalDurationMs: 45000,
              averageDurationMs: 22500,
              totalTokens: 3500,
              averageTokens: 1750,
            },
          },
        ],
      },
    },
  });

  // Add cost tracking
  await prisma.costTracking.create({
    data: {
      runId: benchmarkRun.id,
      totalCost: 0.175,
      totalTokens: 3500,
      totalPromptTokens: 2100,
      totalCompletionTokens: 1400,
      costByProvider: { openai: 0.175 },
      costByAgent: { [gpt4Optimized.id]: 0.175 },
    },
  });

  // Add comments
  await prisma.comment.create({
    data: {
      content: 'Great performance! Ready for production deployment.',
      userId: adminUser.id,
      runId: benchmarkRun.id,
      metadata: { sentiment: 'positive' },
    },
  });

  console.log('✨ Created benchmark run with cost tracking and comments');

  console.log('');
  console.log('🎉 Phase 3 seed completed successfully!');
  console.log('');
  console.log('📊 Created:');
  console.log('   - 2 Organizations');
  console.log('   - 3 Users (admin, member, viewer)');
  console.log('   - 3 Tags');
  console.log('   - 3 Task Suites');
  console.log('   - 4+ Task Items');
  console.log('   - 2 Agent Profiles (with advanced config)');
  console.log('   - 1 Webhook');
  console.log('   - 1 Run Template');
  console.log('   - 1 Complete Benchmark Run');
  console.log('   - Cost Tracking');
  console.log('   - Comments');
  console.log('');
  console.log('🚀 Demo credentials:');
  console.log('   Admin: admin@acme.com');
  console.log('   Member: bob@acme.com');
  console.log('   Viewer: viewer@beta.com');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
