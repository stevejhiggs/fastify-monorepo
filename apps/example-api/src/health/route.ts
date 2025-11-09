import type { ZodFastifyInstance } from '@repo/fastify-zod';

export default function registerRoutes(app: ZodFastifyInstance) {
  app.get('/health', async (_request, reply) => {
    reply.send('OK');
  });
}
