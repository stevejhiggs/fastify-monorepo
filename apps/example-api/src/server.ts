import helmet from '@fastify/helmet';
import { registerSwagger } from '@repo/fastify-swagger';
import { jsonSchemaTransform, registerZodProvider } from '@repo/fastify-zod';
import { fastify } from 'fastify';
import registerRoutes from './routes.js';

export default async function getServer(port: number = 3000) {
  const rawApp = fastify({
    routerOptions: {
      ignoreTrailingSlash: true
    },
    logger: {
      level: process.env['LOG_LEVEL'] || 'info'
    }
  });

  // Set up Zod validators and serializers
  const app = registerZodProvider(rawApp);
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
