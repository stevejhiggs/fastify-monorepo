import fastifySwagger, { type SwaggerOptions, type SwaggerTransform } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance, FastifySchema } from 'fastify';

export type SwaggerConfig = {
  enable: boolean;
  title?: string | undefined;
  version?: string | undefined;
  port: number;
  transform?: SwaggerTransform<FastifySchema>;
  host?: string;
  documentationRoute?: string;
};

export async function registerSwagger(app: FastifyInstance, config: SwaggerConfig) {
  if (!config.enable) {
    return;
  }

  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: config.title ?? 'API',
        version: config.version ?? '1.0.0'
      },
      servers: [
        {
          url: `http://${config.host ?? 'localhost'}:${config.port}`
        }
      ]
    },
    transform: config.transform
  } as SwaggerOptions);

  await app.register(fastifySwaggerUi, {
    routePrefix: config.documentationRoute ?? '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    staticCSP: true
  });
}
