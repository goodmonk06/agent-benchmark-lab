import { FastifyInstance } from 'fastify';
import prisma from '../db';
import { CreateTaskSuiteSchema, CreateTaskItemSchema } from '../types';

export async function suitesRoutes(fastify: FastifyInstance) {
  // Get all task suites
  fastify.get('/suites', async (request, reply) => {
    const suites = await prisma.taskSuite.findMany({
      include: {
        tasks: true,
        _count: {
          select: { tasks: true, runs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return suites;
  });

  // Get single task suite
  fastify.get('/suites/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const suite = await prisma.taskSuite.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!suite) {
      reply.status(404).send({ error: 'Task suite not found' });
      return;
    }

    return suite;
  });

  // Create task suite
  fastify.post('/suites', async (request, reply) => {
    const data = CreateTaskSuiteSchema.parse(request.body);
    const suite = await prisma.taskSuite.create({
      data,
    });
    return suite;
  });

  // Update task suite
  fastify.put('/suites/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = CreateTaskSuiteSchema.partial().parse(request.body);

    const suite = await prisma.taskSuite.update({
      where: { id },
      data,
    });

    return suite;
  });

  // Delete task suite
  fastify.delete('/suites/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.taskSuite.delete({
      where: { id },
    });
    return { success: true };
  });

  // Create task item
  fastify.post('/tasks', async (request, reply) => {
    const data = CreateTaskItemSchema.parse(request.body);
    const task = await prisma.taskItem.create({
      data,
    });
    return task;
  });

  // Update task item
  fastify.put('/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = CreateTaskItemSchema.partial().omit({ suiteId: true }).parse(request.body);

    const task = await prisma.taskItem.update({
      where: { id },
      data,
    });

    return task;
  });

  // Delete task item
  fastify.delete('/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.taskItem.delete({
      where: { id },
    });
    return { success: true };
  });
}
