import type { FastifyBaseLogger, FastifyInstance, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';

// used for swagger generation
export { jsonSchemaTransform, type ZodTypeProvider } from 'fastify-type-provider-zod';

export type ZodFastifyInstance<
  RawServer extends RawServerDefault = RawServerDefault,
  RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
  RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
  Logger extends FastifyBaseLogger = FastifyBaseLogger
> = FastifyInstance<RawServer, RawRequest, RawReply, Logger, ZodTypeProvider>;

// Simplified version that accepts any ZodFastifyInstance (for route handlers)
// biome-ignore lint/suspicious/noExplicitAny: Intentional - this type accepts any ZodFastifyInstance variant
type AnyFastifyInstance = ZodFastifyInstance<any, any, any, any>;

export function registerZodProvider<T extends AnyFastifyInstance>(app: T) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  zodApp.setValidatorCompiler(validatorCompiler);
  zodApp.setSerializerCompiler(serializerCompiler);
  return zodApp;
}
