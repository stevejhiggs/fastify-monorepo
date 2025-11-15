import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';

// used for swagger generation
export { jsonSchemaTransform, type ZodTypeProvider } from 'fastify-type-provider-zod';

export function registerZodProvider(app: FastifyInstanceForRegistration) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  zodApp.setValidatorCompiler(validatorCompiler);
  zodApp.setSerializerCompiler(serializerCompiler);
  return zodApp;
}
