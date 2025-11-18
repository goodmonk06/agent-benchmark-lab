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

  // Zod validation errors
  if (error.name === 'ZodError') {
    reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.issues || error.errors,
    });
    return;
  }

  // Fastify validation errors
  if (error.validation) {
    reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.validation,
    });
    return;
  }

  // Prisma errors
  if (error.code === 'P2002') {
    reply.status(409).send({
      statusCode: 409,
      error: 'Conflict',
      message: 'A record with this data already exists',
    });
    return;
  }

  if (error.code === 'P2025') {
    reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'The requested record was not found',
    });
    return;
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    statusCode,
    error: statusCode >= 500 ? 'Internal Server Error' : error.name || 'Error',
    message: statusCode >= 500 ? 'An unexpected error occurred' : error.message || 'An error occurred',
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
