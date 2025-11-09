import type { ZodFastifyInstance } from '@repo/fastify-base';
import health from './health/route';
import schemaTest from './schema-test/route';

// This is a central place to hook in all your routes
export default function registerRoutes(app: ZodFastifyInstance) {
  health(app);
  schemaTest(app);
}
