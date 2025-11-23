import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';
import { fastifyOtelInstrumentation } from './setup';

export async function registerOpenTelemetry(app: FastifyInstanceForRegistration) {
  await app.register(fastifyOtelInstrumentation.plugin());
}
