/**
 * A simple health check endpoint.
 * Returns a basic OK response with a unique identifier to verify
 * the API is running and responding to requests.
 */
import { randomUUID } from 'node:crypto';
import type { EnhancedFastifyInstance } from '@repo/fastify-base';

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.get('/health', async (_req, reply) => {
    const uuid = randomUUID();
    reply.send(`OK ${uuid}`);
  });
}
