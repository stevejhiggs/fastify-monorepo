import { registerDefaultSecurity } from '@repo/fastify-security';
import { registerSwagger, type SwaggerConfig } from '@repo/fastify-swagger';
import { jsonSchemaTransform, registerZodProvider } from '@repo/fastify-zod';
import { fastify } from 'fastify';
import type { LoggerConfig } from '../../logging/src/logging';

// some things get re-exported from this package, so we need to export them
export type { ZodFastifyInstance } from '@repo/fastify-zod';
export { initLogger } from '@repo/logging';

export type FastifyBaseConfig = {
  port: number;
  swagger: Omit<SwaggerConfig, 'port' | 'transform'>;
  logger?: LoggerConfig;
};

export async function setupBaseApp(config: FastifyBaseConfig) {
  const rawApp = fastify({
    routerOptions: {
      ignoreTrailingSlash: true
    },
    logger: {
      level: config.logger?.logLevel ?? 'info'
    }
  });

  // Set up Zod validators and serializers
  const app = registerZodProvider(rawApp);
  // add security headers
  await registerDefaultSecurity(app);
  // adds open api documentations at /documentation
  await registerSwagger(app, { ...config.swagger, port: config.port, transform: jsonSchemaTransform });

  return app;
}
