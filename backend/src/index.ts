import Fastify from 'fastify';
import cors from '@fastify/cors';
import { suitesRoutes } from './routes/suites.routes';
import { agentsRoutes } from './routes/agents.routes';
import { runsRoutes } from './routes/runs.routes';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Register CORS
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(suitesRoutes, { prefix: '/api' });
fastify.register(agentsRoutes, { prefix: '/api' });
fastify.register(runsRoutes, { prefix: '/api' });

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  if (error.validation) {
    reply.status(400).send({
      error: 'Validation error',
      details: error.validation,
    });
    return;
  }

  reply.status(error.statusCode || 500).send({
    error: error.message || 'Internal server error',
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`🚀 Server listening at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
