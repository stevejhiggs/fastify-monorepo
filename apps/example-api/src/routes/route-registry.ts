import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import caching from './caching/route';
import files from './files/route';
import health from './health/route';
import logging from './logging/route';
import schemaTest from './schema-test/route';

// This is a central place to hook in all your routes
export default function registerRoutes(app: EnhancedFastifyInstance) {
  health(app);
  schemaTest(app);
  logging(app);
  caching(app);
  files(app);
}
