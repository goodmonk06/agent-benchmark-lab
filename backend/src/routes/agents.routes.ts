import { FastifyInstance } from 'fastify';
import prisma from '../db';
import { CreateAgentProfileSchema } from '../types';

export async function agentsRoutes(fastify: FastifyInstance) {
  // Get all agent profiles
  fastify.get('/agents', async (request, reply) => {
    const agents = await prisma.agentProfile.findMany({
      include: {
        _count: {
          select: { runAgents: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return agents;
  });

  // Get single agent profile
  fastify.get('/agents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agent = await prisma.agentProfile.findUnique({
      where: { id },
      include: {
        runAgents: {
          include: {
            run: {
              include: {
                suite: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!agent) {
      reply.status(404).send({ error: 'Agent profile not found' });
      return;
    }

    return agent;
  });

  // Create agent profile
  fastify.post('/agents', async (request, reply) => {
    const data = CreateAgentProfileSchema.parse(request.body);
    const agent = await prisma.agentProfile.create({
      data,
    });
    return agent;
  });

  // Update agent profile
  fastify.put('/agents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = CreateAgentProfileSchema.partial().parse(request.body);

    const agent = await prisma.agentProfile.update({
      where: { id },
      data,
    });

    return agent;
  });

  // Delete agent profile
  fastify.delete('/agents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.agentProfile.delete({
      where: { id },
    });
    return { success: true };
  });
}
