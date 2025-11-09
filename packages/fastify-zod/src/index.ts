import type { FastifyBaseLogger, FastifyInstance, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from 'fastify';
import  { type ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

// used for swagger generation
export { jsonSchemaTransform,  } from 'fastify-type-provider-zod';

export type ZodFastifyInstance = FastifyInstance<RawServerDefault, RawRequestDefaultExpression<RawServerDefault>, RawReplyDefaultExpression<RawServerDefault>, FastifyBaseLogger, ZodTypeProvider>;

export function registerZodProvider(app: FastifyInstance): ZodFastifyInstance {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  zodApp.setValidatorCompiler(validatorCompiler);
  zodApp.setSerializerCompiler(serializerCompiler);
  return zodApp;
}
