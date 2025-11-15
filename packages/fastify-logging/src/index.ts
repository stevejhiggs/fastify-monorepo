import { AsyncLocalStorage } from 'node:async_hooks';
import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';
import type { Logger } from '@repo/logging';
import type { FastifyBaseLogger } from 'fastify';

const asyncLocalStorage = new AsyncLocalStorage<Map<string, unknown>>();
let initialLogger: FastifyBaseLogger;

export function registerPerRequestLogger(app: FastifyInstanceForRegistration, logger: Logger) {
  initialLogger = logger;

  app.addHook('onRequest', (request, _reply, next) => {
    const store = new Map();

    asyncLocalStorage.run(store, () => {
      // Store the contextual logger in the async local storage
      asyncLocalStorage.getStore()?.set('logger', request.log);

      next();
    });
  });
}

export function getLogger(): FastifyBaseLogger {
  return (asyncLocalStorage.getStore()?.get('logger') as FastifyBaseLogger) ?? initialLogger;
}
