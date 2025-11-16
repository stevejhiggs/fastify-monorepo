import { randomUUID } from 'node:crypto';
import type { EnhancedFastifyInstance } from '@repo/fastify-base';

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.get('/health', async (_req, reply) => {
    const uuid = randomUUID();
    reply.send(`OK ${uuid}`);
  });
}
