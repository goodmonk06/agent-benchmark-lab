# Agent Benchmark Lab

A comprehensive platform for benchmarking and comparing different AI agent configurations across standardized task suites.

## Overview

Agent Benchmark Lab enables you to systematically evaluate and compare AI agents with different configurations (models, system prompts, tools) across various domains. Run controlled experiments to understand which agent configurations work best for specific task types.

**Key capabilities:**
- Create task suites organized by domain (code, writing, planning, QA, reasoning)
- Configure agent profiles with different LLM providers, models, and prompts
- Execute benchmarks and automatically score results
- Visualize performance in agent × task matrices
- Track detailed metrics: accuracy, speed, token usage

## Tech Stack

**Backend:**
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Fastify 4.x
- **Database**: PostgreSQL 16+ with Prisma ORM
- **LLM Integration**: OpenAI API, Anthropic API
- **Validation**: Zod
- **Testing**: Vitest

**Frontend:**
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library

**Infrastructure:**
- Docker & Docker Compose
- Monorepo with npm workspaces

## Domain Model

The system revolves around these core entities:

```
TaskSuite (1) ──→ (N) TaskItem
    ↓
BenchmarkRun ──→ BenchmarkRunAgent ──→ BenchmarkResult
                        ↓
                   AgentProfile
```

**TaskSuite**: A collection of related benchmark tasks (e.g., "Code Assistant Benchmark")

**TaskItem**: Individual tasks with input prompts and optional expected outputs

**AgentProfile**: Configuration for an agent (provider, model, system prompt, tools)

**BenchmarkRun**: An execution that tests multiple agents against a task suite

**BenchmarkRunAgent**: Tracks results for one agent in a run (with aggregate metrics)

**BenchmarkResult**: Individual result for one agent on one task (scores, timing, output)

## Getting Started

### Requirements

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)
- OpenAI API key (optional, for testing OpenAI models)
- Anthropic API key (optional, for testing Claude models)

### Quick Start with Docker

1. **Clone and setup environment**

```bash
git clone <repository-url>
cd agent-benchmark-lab

# Copy and configure environment
cp .env.example .env
# Edit .env and add your API keys
```

2. **Start all services with Docker**

```bash
docker compose up -d
```

This starts:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend dashboard on port 3000

3. **Run migrations and seed data**

```bash
# Run database migrations
docker compose exec backend npx prisma migrate deploy

# Seed demo data
docker compose exec backend npm run db:seed
```

4. **Access the application**

Open http://localhost:3000 in your browser.

### Local Development Setup

For development without Docker:

1. **Install dependencies**

```bash
npm install
```

2. **Setup PostgreSQL**

Make sure PostgreSQL is running locally, then create a database:

```bash
createdb agent_benchmark
```

3. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agent_benchmark?schema=public
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

4. **Setup database**

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

5. **Start development servers**

```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on :3001
npm run dev:frontend # Frontend on :3000
```

### Available Scripts

From the root directory:

```bash
npm run dev          # Start both backend and frontend
npm run build        # Build all workspaces
npm run test         # Run all tests
npm run lint         # Lint all workspaces

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema (dev only)
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

## Example Flow: Code Assistant Benchmark

This repository includes a complete vertical slice demonstrating the benchmark workflow.

### 1. View Demo Task Suite

After seeding, navigate to **Task Suites** → **Code Assistant Benchmark**

You'll see 5 pre-configured tasks:
- Hello World Function
- Fibonacci Calculator
- Bug Fix Challenge
- List Comprehension
- Error Handling

Each task has:
- Input prompt (what the agent receives)
- Expected output (optional, for scoring)
- Scoring configuration

### 2. Explore Agent Profiles

Navigate to **Agents** to see demo profiles:
- **GPT-4 Code Expert**: Detailed code-focused system prompt
- **Claude 3 Sonnet Helper**: Concise, practical instructions
- **GPT-3.5 Turbo Baseline**: Simple baseline configuration
- **Technical Writer GPT-4**: Optimized for documentation

### 3. Create a Benchmark Run

Navigate to **Benchmark Runs** → **Create Run**

1. Select "Code Assistant Benchmark" suite
2. Select multiple agents to compare (e.g., GPT-4 vs GPT-3.5)
3. Click "Create & Start Run"

The system will:
- Execute each task with each agent
- Call the respective LLM APIs
- Score outputs using configured methods
- Calculate aggregate metrics

### 4. View Results

Click on your run to see:

**Summary Cards**: Aggregate metrics per agent
- Average score
- Success/failure counts
- Average duration
- Total tokens used

**Results Matrix**: Visual comparison grid (agents × tasks)
- Color-coded scores (green = high, red = low)
- Duration per task
- Quick identification of strengths/weaknesses

**Detailed Results**: Expandable per-agent, per-task breakdown
- Full score details
- Error messages if any
- Token usage per task

### 5. Iterate and Improve

Based on results:
- Modify agent system prompts
- Add more tasks to suites
- Create new agent configurations
- Run comparative benchmarks

## API Endpoints

### Task Suites

```
GET    /api/suites          # List all suites
GET    /api/suites/:id      # Get suite with tasks
POST   /api/suites          # Create suite
PUT    /api/suites/:id      # Update suite
DELETE /api/suites/:id      # Delete suite
```

### Task Items

```
POST   /api/tasks           # Create task
PUT    /api/tasks/:id       # Update task
DELETE /api/tasks/:id       # Delete task
```

### Agent Profiles

```
GET    /api/agents          # List all agents
GET    /api/agents/:id      # Get agent details
POST   /api/agents          # Create agent
PUT    /api/agents/:id      # Update agent
DELETE /api/agents/:id      # Delete agent
```

### Benchmark Runs

```
GET    /api/runs            # List all runs
GET    /api/runs/:id        # Get run with full results
POST   /api/runs            # Create and start run
GET    /api/runs/:id/matrix # Get results matrix
GET    /api/runs/:id/status # Get run status
DELETE /api/runs/:id        # Delete run
```

## Scoring Methods

### 1. Exact Match

Compares output exactly with expected result after normalization (trimming, etc).

```json
{
  "exactMatch": true
}
```

### 2. Similarity Score

Calculates Jaccard similarity between output and expected (0-1 scale).

```json
{
  "similarity": 0.85
}
```

### 3. LLM-as-Judge (Optional)

Uses an LLM to evaluate output quality on a 0-100 scale. Enable in task:

```json
{
  "scoringConfigJson": {
    "useLLMJudge": true
  }
}
```

## Testing

Run tests for all packages:

```bash
npm test
```

Run tests for specific package:

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

Run tests in watch mode:

```bash
cd backend && npm run test:watch
```

Current test coverage:
- ✅ Type validation (Zod schemas)
- ✅ Scoring service logic
- ✅ API client methods

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running:

```bash
# Check Docker containers
docker compose ps

# Check local PostgreSQL
pg_isready
```

Verify `DATABASE_URL` in `.env` is correct.

### API Key Issues

Verify your API keys are set:

```bash
# In .env file
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

Test keys are valid by running a simple benchmark.

### Port Conflicts

If ports 3000 or 3001 are in use:

```bash
# Change backend port in .env
PORT=3002

# Change frontend port when starting
cd frontend && PORT=3001 npm run dev
```

### Docker Issues

```bash
# Rebuild containers
docker compose down
docker compose up --build

# View logs
docker compose logs -f backend
```

## Future Extensions

### Planned Features
- **Streaming results**: Real-time updates as benchmarks execute
- **Parallel execution**: Run multiple tasks simultaneously for speed
- **Cost tracking**: Calculate and display API costs per run
- **Export results**: Download results as CSV/JSON
- **Historical trends**: Visualize performance over time
- **Custom scoring plugins**: User-defined scoring methods
- **Tool support**: Test agents with function calling/tools
- **Batch operations**: Upload multiple tasks via CSV
- **Comparison reports**: Generate formatted comparison documents

### Additional LLM Providers
- Google (Gemini)
- Cohere
- Mistral AI
- Local models (Ollama integration)

### Advanced Features
- A/B testing framework
- Rate limiting and queuing
- User authentication and multi-tenancy
- Webhook notifications for run completion
- Slack/Discord integrations

## Development

### Project Structure

```
agent-benchmark-lab/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Demo data
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   │   ├── llm.service.ts
│   │   │   ├── runner.service.ts
│   │   │   └── scoring.service.ts
│   │   ├── types/             # TypeScript types
│   │   ├── db.ts              # Prisma client
│   │   └── index.ts           # Fastify app
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js pages
│   │   │   ├── suites/
│   │   │   ├── agents/
│   │   │   └── runs/
│   │   └── lib/
│   │       └── api.ts         # API client
│   └── vitest.config.ts
├── docker-compose.yml
└── package.json               # Root workspace config
```

### Adding a New LLM Provider

1. Update `LLMProvider` enum in `backend/src/types/index.ts`
2. Add provider logic in `backend/src/services/llm.service.ts`
3. Update agent creation form in frontend

### Adding a New Scoring Method

1. Add logic in `backend/src/services/scoring.service.ts`
2. Update `ScoreResult` type
3. Update results display in frontend

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Ensure tests pass: `npm test`
5. Ensure types are valid: `npm run lint`
6. Commit your changes: `git commit -m "Add my feature"`
7. Push to your fork: `git push origin feature/my-feature`
8. Open a Pull Request

## License

MIT

---

Built with ❤️ for the AI agent community
