import type { ZodFastifyInstance } from '../types.js';

export default function registerRoutes(app: ZodFastifyInstance) {
  app.get('/health', async (_request, reply) => {
    reply.send('OK');
  });
}
