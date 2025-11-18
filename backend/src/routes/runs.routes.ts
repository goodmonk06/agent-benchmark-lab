import { FastifyInstance } from 'fastify';
import prisma from '../db';
import { CreateBenchmarkRunSchema } from '../types';
import { runnerService } from '../services/runner.service';

export async function runsRoutes(fastify: FastifyInstance) {
  // Get all benchmark runs
  fastify.get('/runs', async (request, reply) => {
    const runs = await prisma.benchmarkRun.findMany({
      include: {
        suite: true,
        agents: {
          include: {
            agentProfile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return runs;
  });

  // Get single benchmark run with detailed results
  fastify.get('/runs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const run = await prisma.benchmarkRun.findUnique({
      where: { id },
      include: {
        suite: {
          include: {
            tasks: true,
          },
        },
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

    if (!run) {
      reply.status(404).send({ error: 'Benchmark run not found' });
      return;
    }

    return run;
  });

  // Create and start benchmark run
  fastify.post('/runs', async (request, reply) => {
    const data = CreateBenchmarkRunSchema.parse(request.body);

    // Create run and run agents
    const run = await prisma.benchmarkRun.create({
      data: {
        suiteId: data.suiteId,
        name: data.name,
        status: 'pending',
        agents: {
          create: data.agentProfileIds.map(agentProfileId => ({
            agentProfileId,
            status: 'pending',
          })),
        },
      },
      include: {
        agents: {
          include: {
            agentProfile: true,
          },
        },
      },
    });

    // Execute run asynchronously
    runnerService.executeBenchmarkRun(run.id).catch(error => {
      console.error(`Error executing run ${run.id}:`, error);
    });

    return run;
  });

  // Get run status
  fastify.get('/runs/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const run = await prisma.benchmarkRun.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        agents: {
          select: {
            id: true,
            status: true,
            agentProfile: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!run) {
      reply.status(404).send({ error: 'Benchmark run not found' });
      return;
    }

    return run;
  });

  // Delete benchmark run
  fastify.delete('/runs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.benchmarkRun.delete({
      where: { id },
    });
    return { success: true };
  });

  // Get results matrix for a run
  fastify.get('/runs/:id/matrix', async (request, reply) => {
    const { id } = request.params as { id: string };

    const run = await prisma.benchmarkRun.findUnique({
      where: { id },
      include: {
        suite: {
          include: {
            tasks: true,
          },
        },
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

    if (!run) {
      reply.status(404).send({ error: 'Benchmark run not found' });
      return;
    }

    // Build matrix: agents × tasks
    const matrix = {
      runId: run.id,
      runName: run.name,
      suiteName: run.suite.name,
      tasks: run.suite.tasks.map(task => ({
        id: task.id,
        name: task.name || `Task ${task.id.slice(0, 8)}`,
      })),
      agents: run.agents.map(runAgent => ({
        id: runAgent.id,
        agentId: runAgent.agentProfile.id,
        agentName: runAgent.agentProfile.name,
        status: runAgent.status,
        metrics: runAgent.metricsJson,
        results: run.suite.tasks.map(task => {
          const result = runAgent.results.find(r => r.taskItemId === task.id);
          return {
            taskId: task.id,
            score: result?.scoreJson,
            durationMs: result?.durationMs,
            tokensUsed: result?.tokensUsed,
            error: result?.errorMessage,
          };
        }),
      })),
    };

    return matrix;
  });
}
