import rateLimitPlugin from '@fastify/rate-limit';
import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';

export type { RateLimitPluginOptions, RateLimitOptions } from '@fastify/rate-limit';

export async function registerRateLimit(app: FastifyInstanceForRegistration, options: Parameters<typeof rateLimitPlugin>[1] = {}) {
  await app.register(rateLimitPlugin, options);
}
