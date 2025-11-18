# Quick Start Guide

Get Agent Benchmark Lab running in under 5 minutes.

## Prerequisites

- Docker & Docker Compose installed
- (Optional) OpenAI or Anthropic API key for testing LLM integrations

## 🚀 Start in 3 Commands

```bash
# 1. Clone and setup
git clone <repository-url>
cd agent-benchmark-lab
cp .env.example .env

# 2. Start with Docker (includes PostgreSQL, backend, frontend)
docker compose up -d

# 3. Setup database and seed demo data
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run db:seed
```

## ✅ Verify It Works

Open http://localhost:3000

You should see:
- **Task Suites**: 3 pre-configured suites (Code, Writing, Planning)
- **Agents**: 4 agent profiles ready to test
- **Benchmark Runs**: 1 sample run with results

## 🎯 Try Your First Benchmark

1. **Navigate to Benchmark Runs** → Click "Create Run"

2. **Select Suite**: Choose "Code Assistant Benchmark"

3. **Select Agents**: Check "GPT-4 Code Expert" and "GPT-3.5 Turbo Baseline"
   - Note: Requires valid API keys in `.env`

4. **Click "Create & Start Run"**

5. **View Results**: The run page shows:
   - Summary cards with aggregate metrics
   - Results matrix (agents × tasks)
   - Detailed per-task breakdowns

## 📊 What's Pre-Configured

### Task Suites
- **Code Assistant Benchmark**: 5 code generation tasks
- **Technical Writing Suite**: 3 documentation tasks
- **Planning & Strategy**: 2 planning tasks

### Agent Profiles
- **GPT-4 Code Expert**: Advanced code generation
- **Claude 3 Sonnet Helper**: Balanced performance
- **GPT-3.5 Turbo Baseline**: Fast baseline
- **Technical Writer GPT-4**: Documentation specialist

## 🔧 Configuration

Edit `.env` to add your API keys:

```env
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Without API keys, you can still:
- Browse the UI
- Create suites and tasks
- Configure agent profiles
- View sample results

## 🛠️ Development Mode

For local development without Docker:

```bash
# Install dependencies
npm install

# Start PostgreSQL locally (or keep Docker Postgres)
createdb agent_benchmark

# Setup database
npm run db:generate
npm run db:migrate
npm run db:seed

# Start dev servers (both backend and frontend)
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

## 📖 Next Steps

- **Add Custom Tasks**: Suites → Select Suite → Add Task
- **Create Agent Profiles**: Agents → Create Agent
- **Run Benchmarks**: Runs → Create Run
- **View API Docs**: See README.md for endpoint reference

## 🔍 Troubleshooting

**Containers won't start:**
```bash
docker compose down
docker compose up --build
```

**Database errors:**
```bash
docker compose exec backend npx prisma migrate reset
docker compose exec backend npm run db:seed
```

**Port conflicts:**
```bash
# Edit docker-compose.yml to change ports
# Or stop conflicting services
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
```

**View logs:**
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## 🎉 You're Ready!

You now have a fully functional agent benchmarking platform.

For detailed documentation, see [README.md](./README.md).
