# Agent Benchmark Lab

A comprehensive platform for benchmarking and comparing different AI agent configurations. Test various models, system prompts, and tool configurations across standardized task suites.

## Features

- **Task Suites**: Create collections of benchmark tasks organized by domain (code, writing, planning, QA, reasoning)
- **Agent Profiles**: Configure different agent setups with various models (OpenAI/Anthropic), system prompts, and tools
- **Benchmark Runs**: Execute benchmarks across multiple agents and tasks with automated scoring
- **Multiple Scoring Methods**: Exact match, similarity scoring, and LLM-as-judge evaluation
- **Matrix View**: Visualize results in an agents × tasks matrix for easy comparison
- **Detailed Metrics**: Track performance with scores, duration, token usage, and success rates

## Architecture

```
agent-benchmark-lab/
├── backend/          # Fastify + TypeScript + Prisma
│   ├── prisma/       # Database schema
│   └── src/
│       ├── routes/   # API endpoints
│       ├── services/ # LLM integration & scoring
│       └── types/    # TypeScript definitions
├── frontend/         # Next.js dashboard
│   └── src/
│       ├── app/      # Pages (suites, agents, runs)
│       └── lib/      # API client
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- OpenAI API key (optional)
- Anthropic API key (optional)

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd agent-benchmark-lab
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/agent_benchmark?schema=public"
PORT=3001

# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (for development)
npm run db:push
```

### 4. Configure Frontend

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 5. Start Development Servers

```bash
# From root directory
npm run dev

# Or start individually:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Usage Guide

### 1. Create a Task Suite

Navigate to **Task Suites** → **Create Suite**

Example: Code Assistant Suite

```json
{
  "name": "Code Assistant Benchmark",
  "description": "Evaluate code generation and debugging capabilities",
  "domain": "code"
}
```

### 2. Add Tasks to Suite

Click on your suite → **Add Task**

**Example Task 1: Hello World**

```json
{
  "name": "Generate Hello World",
  "description": "Generate a simple hello world program in Python",
  "inputJson": {
    "prompt": "Write a Python function that prints 'Hello, World!'"
  },
  "expectedJson": "def hello_world():\n    print('Hello, World!')"
}
```

**Example Task 2: Fibonacci**

```json
{
  "name": "Fibonacci Function",
  "inputJson": {
    "prompt": "Write a Python function to calculate the nth Fibonacci number using recursion"
  },
  "expectedJson": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)"
}
```

**Example Task 3: Bug Fix**

```json
{
  "name": "Debug Loop",
  "inputJson": {
    "prompt": "Fix this buggy code:\n\ndef sum_list(numbers):\n    total = 0\n    for i in range(len(numbers)):\n        total += numbers[i+1]\n    return total"
  },
  "expectedJson": "def sum_list(numbers):\n    total = 0\n    for i in range(len(numbers)):\n        total += numbers[i]\n    return total"
}
```

### 3. Create Agent Profiles

Navigate to **Agents** → **Create Agent**

**Example Agent 1: GPT-4 Code Expert**

```json
{
  "name": "GPT-4 Code Expert",
  "description": "GPT-4 with detailed code-focused system prompt",
  "provider": "openai",
  "model": "gpt-4",
  "systemPrompt": "You are an expert software engineer. Write clean, efficient, and well-documented code. Always include proper error handling and follow best practices.",
  "toolsJson": []
}
```

**Example Agent 2: Claude Sonnet Helper**

```json
{
  "name": "Claude 3 Sonnet Helper",
  "description": "Claude 3 Sonnet with concise instructions",
  "provider": "anthropic",
  "model": "claude-3-sonnet-20240229",
  "systemPrompt": "You are a helpful coding assistant. Provide clear, working code examples.",
  "toolsJson": []
}
```

**Example Agent 3: GPT-3.5 Baseline**

```json
{
  "name": "GPT-3.5 Turbo Baseline",
  "description": "Baseline comparison with GPT-3.5",
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "systemPrompt": "You are a helpful assistant that writes code.",
  "toolsJson": []
}
```

### 4. Run Benchmark

Navigate to **Benchmark Runs** → **Create Run**

1. Select your task suite
2. Select agents to benchmark (can select multiple)
3. Click **Create & Start Run**

The benchmark will execute asynchronously. Results will update automatically.

### 5. View Results

Click on a run to see:
- **Summary Cards**: Aggregate metrics per agent
- **Results Matrix**: Visual comparison (agents × tasks)
- **Detailed Results**: Full scores, timing, and error details

## Example Use Cases

### Use Case 1: Code Assistant Comparison

Compare different models for code generation tasks:

**Task Suite**: Code Assistant Benchmark
- Generate functions (basic, intermediate, advanced)
- Debug code
- Explain code
- Optimize algorithms

**Agents to Test**:
- GPT-4 with detailed system prompt
- Claude 3 Opus with code focus
- GPT-3.5 as baseline
- Claude 3 Haiku for speed comparison

**Expected Insights**:
- Which model produces most accurate code?
- Which is fastest?
- Token usage comparison
- Success rate on complex vs. simple tasks

### Use Case 2: Product Spec Writer

Benchmark agents for technical writing:

**Task Suite**: Product Spec Writing
- Write feature specifications
- Create user stories
- Draft API documentation
- Generate test plans

**Sample Task**:

```json
{
  "name": "User Authentication Spec",
  "inputJson": {
    "prompt": "Write a detailed product specification for a user authentication system including: user registration, login, password reset, and session management. Include security considerations and API endpoints."
  },
  "scoringConfigJson": {
    "useLLMJudge": true
  }
}
```

**Agents to Test**:
- GPT-4 with technical writer persona
- Claude 3 Opus with structured output focus
- Different system prompts for same model

### Use Case 3: Planning Agent

Test agents for task planning and breakdown:

**Task Suite**: Task Planning Benchmark
- Project planning
- Breaking down complex tasks
- Resource estimation
- Risk identification

**Sample Task**:

```json
{
  "name": "E-commerce Migration Plan",
  "inputJson": {
    "prompt": "Create a detailed plan to migrate an existing e-commerce platform from monolith to microservices. Include phases, team requirements, risks, and timeline."
  },
  "scoringConfigJson": {
    "useLLMJudge": true
  }
}
```

### Use Case 4: QA Test Generation

Benchmark agents for test case generation:

**Task Suite**: QA Test Generation
- Unit test generation
- Integration test scenarios
- Edge case identification
- Test data generation

**Sample Task**:

```json
{
  "name": "Shopping Cart Tests",
  "inputJson": {
    "prompt": "Generate comprehensive test cases for an e-commerce shopping cart including: adding items, removing items, updating quantities, applying discounts, and checkout."
  }
}
```

## Scoring Methods

### 1. Exact Match

Compares output exactly with expected result (after normalization).

```json
{
  "exactMatch": true
}
```

### 2. Similarity Score

Calculates Jaccard similarity between output and expected (0-1).

```json
{
  "similarity": 0.85
}
```

### 3. LLM-as-Judge

Uses GPT-4 to evaluate output quality (0-100).

Enable in task:

```json
{
  "scoringConfigJson": {
    "useLLMJudge": true
  }
}
```

Result:

```json
{
  "llmJudgeScore": 92,
  "llmJudgeReasoning": "The code is correct, well-structured, and includes proper error handling."
}
```

## API Reference

### Task Suites

- `GET /api/suites` - List all suites
- `GET /api/suites/:id` - Get suite with tasks
- `POST /api/suites` - Create suite
- `PUT /api/suites/:id` - Update suite
- `DELETE /api/suites/:id` - Delete suite

### Task Items

- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Agent Profiles

- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent details
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Benchmark Runs

- `GET /api/runs` - List all runs
- `GET /api/runs/:id` - Get run details
- `POST /api/runs` - Create and start run
- `GET /api/runs/:id/matrix` - Get results matrix
- `GET /api/runs/:id/status` - Get run status
- `DELETE /api/runs/:id` - Delete run

## Database Schema

See `backend/prisma/schema.prisma` for the complete schema.

Key models:
- **TaskSuite**: Collection of related tasks
- **TaskItem**: Individual benchmark task
- **AgentProfile**: Agent configuration (model + prompt + tools)
- **BenchmarkRun**: A benchmark execution
- **BenchmarkRunAgent**: Junction table with aggregated metrics
- **BenchmarkResult**: Individual result for agent × task

## Development

### Database Management

```bash
cd backend

# View database in Prisma Studio
npm run db:studio

# Create new migration
npm run db:migrate

# Reset database
npx prisma migrate reset
```

### Adding New Scoring Methods

Edit `backend/src/services/scoring.service.ts`:

```typescript
private customScore(output: any, expected: any, scoringConfig: any): Record<string, any> {
  // Add your custom scoring logic here
  return {
    myCustomScore: calculateScore(output, expected)
  };
}
```

### Adding New LLM Providers

Edit `backend/src/services/llm.service.ts`:

```typescript
async execute(provider: LLMProvider, model: string, systemPrompt: string, userInput: string) {
  if (provider === 'my-provider') {
    return await this.executeMyProvider(model, systemPrompt, userInput);
  }
  // ...
}
```

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and credentials are correct in `.env`:

```bash
# Check PostgreSQL status
systemctl status postgresql  # Linux
brew services list           # macOS
```

### API Key Issues

Verify API keys are set correctly:

```bash
cd backend
node -e "console.log(process.env.OPENAI_API_KEY)"
```

### Port Conflicts

If ports 3000 or 3001 are in use, change them:

```bash
# Backend - edit backend/.env
PORT=3002

# Frontend - run with custom port
cd frontend
PORT=3001 npm run dev
```

## Production Deployment

### Backend

```bash
cd backend
npm run build
npm start
```

Set environment variables for production:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `PORT`
- `CORS_ORIGIN`

### Frontend

```bash
cd frontend
npm run build
npm start
```

Set environment variable:
- `NEXT_PUBLIC_API_URL`

### Docker (Optional)

Create `Dockerfile` in backend and frontend directories, or use a `docker-compose.yml` to orchestrate services.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

- [ ] Export results to CSV/JSON
- [ ] Historical trend visualization
- [ ] Custom scoring plugins
- [ ] Parallel execution optimization
- [ ] Real-time streaming results
- [ ] Support for additional LLM providers (Cohere, etc.)
- [ ] Cost tracking and analysis
- [ ] A/B testing framework
- [ ] API rate limiting and queuing
