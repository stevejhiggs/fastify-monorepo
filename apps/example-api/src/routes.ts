import type { ZodFastifyInstance } from '@repo/fastify-zod';
import health from './health/route.js';
import schemaTest from './schema-test/route.js';

// This is a central place to hook in all your routes
export default function registerRoutes(app: ZodFastifyInstance) {
  health(app);
  schemaTest(app);
}
