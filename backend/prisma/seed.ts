import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (in reverse order of dependencies)
  await prisma.benchmarkResult.deleteMany();
  await prisma.benchmarkRunAgent.deleteMany();
  await prisma.benchmarkRun.deleteMany();
  await prisma.agentProfile.deleteMany();
  await prisma.taskItem.deleteMany();
  await prisma.taskSuite.deleteMany();

  console.log('✨ Cleaned existing data');

  // Create Task Suites
  const codeSuite = await prisma.taskSuite.create({
    data: {
      name: 'Code Assistant Benchmark',
      description: 'Evaluate code generation and debugging capabilities',
      domain: 'code',
    },
  });

  const writingSuite = await prisma.taskSuite.create({
    data: {
      name: 'Technical Writing Suite',
      description: 'Test technical documentation and specification writing',
      domain: 'writing',
    },
  });

  const planningSuite = await prisma.taskSuite.create({
    data: {
      name: 'Planning & Strategy',
      description: 'Evaluate task breakdown and project planning abilities',
      domain: 'planning',
    },
  });

  console.log('✨ Created task suites');

  // Create Tasks for Code Suite
  await prisma.taskItem.createMany({
    data: [
      {
        suiteId: codeSuite.id,
        name: 'Hello World Function',
        description: 'Generate a simple hello world function',
        inputJson: {
          prompt: 'Write a Python function that prints "Hello, World!" to the console.',
        },
        expectedJson: 'def hello_world():\n    print("Hello, World!")',
        scoringConfigJson: {
          useExactMatch: true,
          useSimilarity: true,
        },
      },
      {
        suiteId: codeSuite.id,
        name: 'Fibonacci Calculator',
        description: 'Generate a recursive Fibonacci function',
        inputJson: {
          prompt: 'Write a Python function to calculate the nth Fibonacci number using recursion. Include base cases for n=0 and n=1.',
        },
        expectedJson: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)',
        scoringConfigJson: {
          useSimilarity: true,
        },
      },
      {
        suiteId: codeSuite.id,
        name: 'Bug Fix Challenge',
        description: 'Fix a buggy array sum function',
        inputJson: {
          prompt: 'Fix the following buggy code:\n\ndef sum_list(numbers):\n    total = 0\n    for i in range(len(numbers)):\n        total += numbers[i+1]\n    return total\n\nWhat is wrong and how should it be fixed?',
        },
        expectedJson: 'def sum_list(numbers):\n    total = 0\n    for i in range(len(numbers)):\n        total += numbers[i]\n    return total',
        scoringConfigJson: {
          useSimilarity: true,
        },
      },
      {
        suiteId: codeSuite.id,
        name: 'List Comprehension',
        description: 'Create a list comprehension for filtering',
        inputJson: {
          prompt: 'Write a Python list comprehension that takes a list of numbers and returns only the even numbers.',
        },
        expectedJson: 'even_numbers = [x for x in numbers if x % 2 == 0]',
        scoringConfigJson: {
          useSimilarity: true,
        },
      },
      {
        suiteId: codeSuite.id,
        name: 'Error Handling',
        description: 'Add proper error handling to a function',
        inputJson: {
          prompt: 'Write a Python function that safely divides two numbers, handling division by zero with a try-except block.',
        },
        expectedJson: null,
        scoringConfigJson: {
          useLLMJudge: false,
        },
      },
    ],
  });

  // Create Tasks for Writing Suite
  await prisma.taskItem.createMany({
    data: [
      {
        suiteId: writingSuite.id,
        name: 'API Documentation',
        description: 'Document a REST API endpoint',
        inputJson: {
          prompt: 'Write documentation for a POST /api/users endpoint that creates a new user. Include: description, request body schema (name, email, password), response format, and possible error codes.',
        },
        expectedJson: null,
        scoringConfigJson: {
          useLLMJudge: false,
        },
      },
      {
        suiteId: writingSuite.id,
        name: 'Feature Specification',
        description: 'Write a feature spec',
        inputJson: {
          prompt: 'Write a brief feature specification for a user authentication system including: user registration, login, password reset, and session management.',
        },
        expectedJson: null,
        scoringConfigJson: {
          useLLMJudge: false,
        },
      },
      {
        suiteId: writingSuite.id,
        name: 'README Section',
        description: 'Create installation instructions',
        inputJson: {
          prompt: 'Write clear installation instructions for a Node.js project that uses PostgreSQL. Include prerequisites and step-by-step setup.',
        },
        expectedJson: null,
        scoringConfigJson: {
          useLLMJudge: false,
        },
      },
    ],
  });

  // Create Tasks for Planning Suite
  await prisma.taskItem.createMany({
    data: [
      {
        suiteId: planningSuite.id,
        name: 'Project Breakdown',
        description: 'Break down a complex project into tasks',
        inputJson: {
          prompt: 'Break down the task of "Build a blog platform" into 5-7 main development tasks. Include backend, frontend, and deployment considerations.',
        },
        expectedJson: null,
        scoringConfigJson: {
          useLLMJudge: false,
        },
      },
      {
        suiteId: planningSuite.id,
        name: 'Risk Assessment',
        description: 'Identify risks in a migration project',
        inputJson: {
          prompt: 'Identify the top 5 risks when migrating a monolithic application to microservices, and suggest mitigation strategies.',
        },
        expectedJson: null,
        scoringConfigJson: {
          useLLMJudge: false,
        },
      },
    ],
  });

  console.log('✨ Created task items');

  // Create Agent Profiles
  const gpt4Agent = await prisma.agentProfile.create({
    data: {
      name: 'GPT-4 Code Expert',
      description: 'GPT-4 with detailed code-focused system prompt',
      provider: 'openai',
      model: 'gpt-4',
      systemPrompt: 'You are an expert software engineer. Write clean, efficient, and well-documented code. Always include proper error handling and follow best practices. Keep your responses concise and focused on the code itself.',
      toolsJson: [],
    },
  });

  const claudeSonnetAgent = await prisma.agentProfile.create({
    data: {
      name: 'Claude 3 Sonnet Helper',
      description: 'Claude 3 Sonnet with concise instructions',
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      systemPrompt: 'You are a helpful coding assistant. Provide clear, working code examples. Be concise and practical.',
      toolsJson: [],
    },
  });

  const gpt35Agent = await prisma.agentProfile.create({
    data: {
      name: 'GPT-3.5 Turbo Baseline',
      description: 'Baseline comparison with GPT-3.5',
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      systemPrompt: 'You are a helpful assistant that writes code.',
      toolsJson: [],
    },
  });

  const technicalWriterAgent = await prisma.agentProfile.create({
    data: {
      name: 'Technical Writer GPT-4',
      description: 'GPT-4 optimized for technical writing',
      provider: 'openai',
      model: 'gpt-4',
      systemPrompt: 'You are an experienced technical writer. Create clear, comprehensive documentation that is easy to understand. Use proper formatting and structure. Focus on clarity and completeness.',
      toolsJson: [],
    },
  });

  console.log('✨ Created agent profiles');

  // Create a sample benchmark run (without executing it)
  const sampleRun = await prisma.benchmarkRun.create({
    data: {
      name: 'Initial Code Assistant Comparison',
      suiteId: codeSuite.id,
      status: 'completed',
      agents: {
        create: [
          {
            agentProfileId: gpt4Agent.id,
            status: 'completed',
            metricsJson: {
              totalTasks: 5,
              successfulTasks: 5,
              failedTasks: 0,
              averageScore: 92.5,
              totalDurationMs: 15000,
              averageDurationMs: 3000,
              totalTokens: 2500,
              averageTokens: 500,
            },
          },
          {
            agentProfileId: gpt35Agent.id,
            status: 'completed',
            metricsJson: {
              totalTasks: 5,
              successfulTasks: 5,
              failedTasks: 0,
              averageScore: 78.3,
              totalDurationMs: 10000,
              averageDurationMs: 2000,
              totalTokens: 1800,
              averageTokens: 360,
            },
          },
        ],
      },
    },
  });

  console.log('✨ Created sample benchmark run');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Created:');
  console.log(`   - ${3} Task Suites`);
  console.log(`   - ${10} Task Items`);
  console.log(`   - ${4} Agent Profiles`);
  console.log(`   - ${1} Sample Benchmark Run`);
  console.log('');
  console.log('🚀 You can now:');
  console.log('   1. Start the backend: npm run dev');
  console.log('   2. View in Prisma Studio: npm run db:studio');
  console.log('   3. Access the frontend: http://localhost:3000');
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
