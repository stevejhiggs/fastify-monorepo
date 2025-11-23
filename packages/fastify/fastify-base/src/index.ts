import { registerMultipart } from '@repo/fastify-multipart';
import { registerPerRequestLogger } from '@repo/fastify-observability/logging';
import { registerOpenTelemetry } from '@repo/fastify-observability/open-telemetry';
import { registerDefaultSecurity } from '@repo/fastify-security';
import { registerSwagger, type SwaggerConfig } from '@repo/fastify-swagger';
import { jsonSchemaTransform, registerZodProvider, type ZodTypeProvider } from '@repo/fastify-zod';
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

  await registerOpenTelemetry(rawApp);

  registerPerRequestLogger(rawApp, logger);

  // Set up Zod validators and serializers
  const app = registerZodProvider(rawApp);
  // support multipart/form-data requests for file uploads
  registerMultipart(app, { limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB max file size, you can enforce limits lower than this via validation
  // add security headers
  await registerDefaultSecurity(app);
  // adds open api documentations at /documentation
  await registerSwagger(app, { ...config.swagger, port: config.port, transform: jsonSchemaTransform });

  return { app };
}
