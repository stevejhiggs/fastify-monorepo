import helmet from '@fastify/helmet';
import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';

export async function registerDefaultSecurity(app: FastifyInstanceForRegistration) {
  // add security headers
  await app.register(helmet);
}
