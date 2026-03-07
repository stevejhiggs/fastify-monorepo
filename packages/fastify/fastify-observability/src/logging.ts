import { fastifyRequestContext, requestContext } from '@fastify/request-context';
import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';
import { initLogger, type Logger } from '@repo/logging';
import type { FastifyBaseLogger } from 'fastify';

declare module '@fastify/request-context' {
  interface RequestContextData {
    logger: FastifyBaseLogger;
  }
}

// Fallback for errors that occur before registerPerRequestLogger is called
// (e.g. uncaughtException during module load / server startup)
const fallbackLogger = initLogger();

let initialLogger: FastifyBaseLogger = fallbackLogger;

export function registerPerRequestLogger(app: FastifyInstanceForRegistration, logger: Logger) {
  initialLogger = logger;

  app.register(fastifyRequestContext, {
    defaultStoreValues: (request) => ({
      logger: request.log.child({})
    })
  });
}

export function getPerRequestLogger(): FastifyBaseLogger {
  return requestContext.get('logger') ?? initialLogger;
}
