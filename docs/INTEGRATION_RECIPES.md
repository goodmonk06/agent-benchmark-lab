# Integration Recipes

This document provides practical recipes for integrating the Agent Benchmark Lab with other systems in a larger ecosystem.

## Table of Contents

- [Webhook Integrations](#webhook-integrations)
- [Cost Tracking Integration](#cost-tracking-integration)
- [Authentication Integration](#authentication-integration)
- [Notification Systems](#notification-systems)
- [Metrics & Observability](#metrics--observability)
- [Data Export & Analytics](#data-export--analytics)

## Webhook Integrations

### Slack Notifications

Get notified in Slack when benchmark runs complete:

```typescript
// Create a Slack webhook
const webhook = await prisma.webhook.create({
  data: {
    organizationId: 'org-123',
    name: 'Slack - AI Team',
    url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
    events: ['run.completed', 'run.failed'],
    secret: process.env.SLACK_WEBHOOK_SECRET,
    headers: {
      'Content-Type': 'application/json',
    },
    isActive: true,
  },
});

// The webhook will be automatically triggered when events occur
// Payload format:
{
  "event": "run.completed",
  "data": {
    "runId": "run-123",
    "suiteId": "suite-456",
    "status": "completed",
    "metrics": {
      "averageScore": 92.5,
      "totalDurationMs": 45000,
      "totalCost": 0.15
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Discord Integration

```typescript
const discordWebhook = await prisma.webhook.create({
  data: {
    organizationId: 'org-123',
    name: 'Discord - Benchmarks',
    url: 'https://discord.com/api/webhooks/YOUR/WEBHOOK',
    events: ['run.completed'],
    isActive: true,
  },
});
```

### Custom Webhook Handler

```typescript
import { eventBus } from './lib/events';
import { notificationProviderRegistry } from './lib/adapters/notification-provider.adapter';

// Listen to events and trigger webhooks
eventBus.on('run.completed', async (event) => {
  const run = event.data;

  // Get webhooks for this organization
  const webhooks = await prisma.webhook.findMany({
    where: {
      organizationId: run.organizationId,
      events: { has: 'run.completed' },
      isActive: true,
    },
  });

  // Trigger each webhook
  for (const webhook of webhooks) {
    const provider = notificationProviderRegistry.get('webhook');
    await provider?.send({
      recipientEmail: webhook.url,
      data: event.data,
    });
  }
});
```

## Cost Tracking Integration

### Budget Alerts

```typescript
import { events } from './lib/events';

eventBus.on('cost.calculated', async (event) => {
  const { runId, totalCost } = event.data;

  const run = await prisma.benchmarkRun.findUnique({
    where: { id: runId },
    include: { organization: true },
  });

  const orgBudget = run.organization.settings.monthlyBudget || 1000;

  // Check if over budget
  const monthStart = new Date();
  monthStart.setDate(1);

  const monthSpending = await prisma.costTracking.aggregate({
    where: {
      createdAt: { gte: monthStart },
      run: { organizationId: run.organizationId },
    },
    _sum: { totalCost: true },
  });

  if (monthSpending._sum.totalCost > orgBudget * 0.9) {
    // Send alert
    await notifyBudgetAlert(run.organizationId, monthSpending._sum.totalCost, orgBudget);
  }
});
```

### Cost Reporting

```typescript
// Generate monthly cost report
async function generateCostReport(organizationId: string, month: Date) {
  const costTracking = await prisma.costTracking.findMany({
    where: {
      createdAt: {
        gte: new Date(month.getFullYear(), month.getMonth(), 1),
        lt: new Date(month.getFullYear(), month.getMonth() + 1, 1),
      },
      run: { organizationId },
    },
    include: {
      run: {
        include: {
          agents: {
            include: {
              agentProfile: true,
            },
          },
        },
      },
    },
  });

  return {
    totalCost: costTracking.reduce((sum, ct) => sum + ct.totalCost, 0),
    totalTokens: costTracking.reduce((sum, ct) => sum + ct.totalTokens, 0),
    byProvider: aggregateBy(costTracking, 'provider'),
    byModel: aggregateBy(costTracking, 'model'),
    runs: costTracking.length,
  };
}
```

## Authentication Integration

### JWT Integration

```typescript
import { FastifyInstance } from 'fastify';
import { verify } from 'jsonwebtoken';

// Add authentication middleware
fastify.addHook('preHandler', async (request, reply) => {
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);

    // Attach user to request
    request.user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true },
    });

    if (!request.user) {
      reply.code(401).send({ error: 'User not found' });
      return;
    }
  } catch (error) {
    reply.code(401).send({ error: 'Invalid token' });
  }
});
```

### SSO Integration

```typescript
// Example: Auth0 integration
import { auth } from 'express-oauth2-jwt-bearer';

const checkJwt = auth({
  audience: 'https://api.agent-benchmark-lab.com',
  issuerBaseURL: 'https://YOUR_DOMAIN.auth0.com/',
});

fastify.addHook('preHandler', async (request, reply) => {
  await checkJwt(request.raw, reply.raw);

  const sub = request.raw.auth?.payload.sub;
  request.user = await prisma.user.findFirst({
    where: { metadata: { path: ['auth0_sub'], equals: sub } },
  });
});
```

## Notification Systems

### Email Notifications

```typescript
import { INotificationProvider } from './lib/adapters/notification-provider.adapter';
import nodemailer from 'nodemailer';

class EmailNotificationProvider extends INotificationProvider {
  name = 'email';
  private transporter;

  constructor(config: any) {
    super();
    this.transporter = nodemailer.createTransport(config);
  }

  async send(context: NotificationContext): Promise<NotificationResult> {
    try {
      await this.transporter.sendMail({
        from: 'noreply@agent-benchmark-lab.com',
        to: context.recipientEmail,
        subject: 'Benchmark Run Completed',
        html: this.renderTemplate(context.data),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private renderTemplate(data: any): string {
    return `
      <h2>Benchmark Run Completed</h2>
      <p>Run: ${data.runName}</p>
      <p>Average Score: ${data.averageScore}</p>
      <p>Duration: ${data.durationMs}ms</p>
    `;
  }
}

// Register the provider
notificationProviderRegistry.register(new EmailNotificationProvider({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}));
```

## Metrics & Observability

### Prometheus Integration

```typescript
import { metrics, MetricNames } from './lib/metrics';
import { register, Counter, Histogram } from 'prom-client';

// Export metrics in Prometheus format
fastify.get('/metrics', async (request, reply) => {
  reply.header('Content-Type', register.contentType);
  return register.metrics();
});

// Record metrics
eventBus.on('run.completed', (event) => {
  metrics.counter(MetricNames.RUN_COMPLETED, 1, {
    organizationId: event.data.organizationId,
    status: event.data.status,
  });

  metrics.histogram(MetricNames.BENCHMARK_RUN_DURATION, event.data.durationMs, {
    suiteId: event.data.suiteId,
  });
});
```

### DataDog Integration

```typescript
import { StatsD } from 'hot-shots';

const statsd = new StatsD({
  host: process.env.DATADOG_AGENT_HOST,
  port: 8125,
  prefix: 'agent_benchmark.',
});

eventBus.on('result.scored', (event) => {
  statsd.histogram('score', event.data.score, {
    agent: event.data.agentId,
    task: event.data.taskId,
  });
});
```

## Data Export & Analytics

### BigQuery Export

```typescript
import { BigQuery } from '@google-cloud/bigquery';

async function exportRunToBigQuery(runId: string) {
  const bigquery = new BigQuery();
  const dataset = bigquery.dataset('agent_benchmarks');
  const table = dataset.table('runs');

  const run = await prisma.benchmarkRun.findUnique({
    where: { id: runId },
    include: {
      agents: {
        include: {
          results: true,
          agentProfile: true,
        },
      },
    },
  });

  const rows = run.agents.flatMap((agent) =>
    agent.results.map((result) => ({
      run_id: run.id,
      agent_id: agent.agentProfile.id,
      agent_name: agent.agentProfile.name,
      task_id: result.taskItemId,
      score: result.scoreJson?.score || 0,
      duration_ms: result.durationMs,
      tokens_used: result.tokensUsed,
      cost: result.estimatedCost,
      timestamp: result.createdAt,
    }))
  );

  await table.insert(rows);
}
```

### CSV Export

```typescript
import { stringify } from 'csv-stringify/sync';

async function exportRunToCSV(runId: string): Promise<string> {
  const run = await prisma.benchmarkRun.findUnique({
    where: { id: runId },
    include: {
      suite: true,
      agents: {
        include: {
          agentProfile: true,
          results: {
            include: {
              taskItem: true,
            },
          },
        },
      },
    },
  });

  const records = run.agents.flatMap((agent) =>
    agent.results.map((result) => ({
      'Run ID': run.id,
      'Run Name': run.name,
      'Suite': run.suite.name,
      'Agent': agent.agentProfile.name,
      'Task': result.taskItem.name,
      'Score': result.scoreJson?.score || 0,
      'Duration (ms)': result.durationMs,
      'Tokens': result.tokensUsed,
      'Cost': result.estimatedCost,
      'Date': result.createdAt.toISOString(),
    }))
  );

  return stringify(records, { header: true });
}
```

## Event Streaming

### Kafka Integration

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'agent-benchmark-lab',
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

// Stream all events to Kafka
Object.values(DomainEventType).forEach((eventType) => {
  eventBus.on(eventType, async (event) => {
    await producer.send({
      topic: 'benchmark-events',
      messages: [
        {
          key: event.type,
          value: JSON.stringify(event),
        },
      ],
    });
  });
});
```

## Best Practices

1. **Use Events for Integration**: Leverage the domain event system rather than tightly coupling systems.

2. **Implement Idempotency**: Webhooks may be delivered multiple times. Include event IDs and check for duplicates.

3. **Handle Failures Gracefully**: Implement retry logic with exponential backoff for external integrations.

4. **Monitor Integration Health**: Track webhook delivery success rates and alert on failures.

5. **Secure Webhooks**: Always use HTTPS and validate webhook signatures.

6. **Rate Limiting**: Implement rate limits to prevent abuse of integration endpoints.

7. **Data Privacy**: Filter sensitive data before sending to external systems.

8. **Version APIs**: Version your integration APIs to allow graceful migration.
