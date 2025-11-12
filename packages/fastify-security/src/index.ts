import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';

// Helper type to simplify FastifyInstance generics
// biome-ignore lint/suspicious/noExplicitAny: Intentional - this type accepts any FastifyInstance variant
type AnyFastifyInstance = FastifyInstance<any, any, any, any, any>;

export async function registerDefaultSecurity(app: AnyFastifyInstance) {
  // add security headers
  await app.register(helmet);
}
