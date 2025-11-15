import { fastifyRequestContext, requestContext } from '@fastify/request-context';
import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';
import type { Logger } from '@repo/logging';
import type { FastifyBaseLogger } from 'fastify';

declare module '@fastify/request-context' {
  interface RequestContextData {
    logger: FastifyBaseLogger;
  }
}

let initialLogger: FastifyBaseLogger;

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
