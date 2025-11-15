import type { FastifyInstance } from 'fastify';

// biome-ignore lint/suspicious/noExplicitAny: When registering plugins, we don't care about the internal extensions of fastify
export type FastifyInstanceForRegistration = FastifyInstance<any, any, any, any, any>;
