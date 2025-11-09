import helmet from '@fastify/helmet';
import { registerSwagger } from '@repo/fastify-swagger';
import { fastify } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import registerRoutes from './routes.js';

export default async function getServer(port: number = 3000) {
  const app = fastify({
    routerOptions: {
      ignoreTrailingSlash: true
    },
    logger: {
      level: process.env['LOG_LEVEL'] || 'info'
    }
  }).withTypeProvider<ZodTypeProvider>();

  // Set up Zod validators and serializers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // add security headers
  await app.register(helmet);

  // adds open api documentations at /documentation
  await registerSwagger(app, {
    enable: process.env['DISABLE_DOCS'] !== 'true',
    port,
    title: 'Example-api',
    version: '1.0.0',
    transform: jsonSchemaTransform
  });

  registerRoutes(app);

  return app;
}
