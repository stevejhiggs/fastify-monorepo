/**
 * Per-route rate limiting example.
 * Demonstrates applying a rate limit to a specific route using the route
 * config. This route is limited to 5 req/min to simulate a sensitive endpoint.
 */
import type { EnhancedFastifyInstance } from '@repo/fastify-base';

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.get(
    '/rate-limited',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute'
        }
      }
    },
    async (_req, reply) => {
      reply.send({ message: 'OK', limit: '5 requests per minute on this route' });
    }
  );
}
