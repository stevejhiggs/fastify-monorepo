import { randomUUID } from 'node:crypto';
import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import { getLogger } from '@repo/fastify-base';

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.get('/health', async (_req, reply) => {
    const uuid = randomUUID();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    getLogger().info(`Health check ${uuid}`);
    reply.send(`OK ${uuid}`);
  });
}
