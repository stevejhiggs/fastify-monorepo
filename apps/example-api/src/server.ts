import { setupBaseApp } from '@repo/fastify-base';
import registerRoutes from './routes/route-registry';

export default async function getServer(port: number = 3000) {
  const app = await setupBaseApp({
    port,
    logger: {
      logLevel: process.env['LOG_LEVEL']
    },
    swagger: {
      enable: process.env['DISABLE_DOCS'] !== 'true',
      title: 'Example-api',
      version: '1.0.0'
    }
  });

  registerRoutes(app);

  return app;
}
