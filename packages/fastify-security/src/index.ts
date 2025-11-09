import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';

export async function registerDefaultSecurity(app: FastifyInstance) {
  // add security headers
  await app.register(helmet);
}
