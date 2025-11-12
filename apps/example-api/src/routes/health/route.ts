import type { AnyZodFastifyInstance } from '@repo/fastify-base';
import { getLogger } from '@repo/fastify-base';

export default function registerRoutes(app: AnyZodFastifyInstance) {
  app.get('/health', async (_request, reply) => {
    getLogger().info('Health check');
    reply.send('OK');
  });
}
