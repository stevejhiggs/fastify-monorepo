/**
 * Request-scoped logging that maintains context across function calls.
 * Shows how the logger can be accessed from anywhere in the request lifecycle
 * (including nested functions) and automatically retains request context for
 * structured logging and tracing.
 */
import { randomUUID } from 'node:crypto';
import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import { logger } from '@repo/fastify-base/logging';

function outerFunction() {
  const uuid = randomUUID();
  logger.instance.info(`this is a test message from outer function ${uuid}`);
  logger.instance.info('the logger can be accessed from anywhere and retains the context of the request');
}

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.get('/logging', async (_req, reply) => {
    outerFunction();
    reply.send(`OK`);
  });
}
