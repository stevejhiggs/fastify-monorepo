import { setupBaseApp } from '@repo/fastify-base';
import { name, version } from '../package.json';
import registerRoutes from './routes/route-registry';

export default async function getServer(port: number = 3000) {
  const { app } = await setupBaseApp({
    port,
    logger: {
      logLevel: process.env['LOG_LEVEL']
    },
    serviceInfo: {
      name,
      version
    },
    swagger: {
      enable: process.env['DISABLE_DOCS'] !== 'true'
    }
  });

  registerRoutes(app);

  return app;
}
