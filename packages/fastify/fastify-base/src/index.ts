import { registerPerRequestLogger } from '@repo/fastify-observability/logging';
import { registerDefaultSecurity } from '@repo/fastify-security';
import { registerSwagger, type SwaggerConfig } from '@repo/fastify-swagger';
// some things get re-exported from this package, so we need to export them
import type { ZodTypeProvider } from '@repo/fastify-zod';
import { jsonSchemaTransform, registerZodProvider } from '@repo/fastify-zod';
import { initLogger, type LoggerConfig } from '@repo/logging';
import {
  type FastifyBaseLogger,
  type FastifyInstance,
  fastify,
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerDefault
} from 'fastify';

export type FastifyBaseConfig = {
  port: number;
  swagger: Omit<SwaggerConfig, 'port' | 'transform'>;
  logger?: LoggerConfig;
};

export type EnhancedFastifyInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export async function setupBaseApp(config: FastifyBaseConfig): Promise<{ app: EnhancedFastifyInstance }> {
  const logger = initLogger(config.logger);

  const rawApp = fastify({
    routerOptions: {
      ignoreTrailingSlash: true
    },
    loggerInstance: logger
  });

  registerPerRequestLogger(rawApp, logger);

  // Set up Zod validators and serializers
  const app = registerZodProvider(rawApp);
  // add security headers
  await registerDefaultSecurity(app);
  // adds open api documentations at /documentation
  await registerSwagger(app, { ...config.swagger, port: config.port, transform: jsonSchemaTransform });

  return { app };
}
