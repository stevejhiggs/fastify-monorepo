import { AsyncLocalStorage } from 'node:async_hooks';
import type { Logger } from '@repo/logging';
import type { FastifyInstance } from 'fastify';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyFastifyInstance = FastifyInstance<any, any, any, any, any>;

const asyncLocalStorage = new AsyncLocalStorage<Map<string, unknown>>();
let initialLogger: Logger;

export function registerPerRequestLogger(app: AnyFastifyInstance, logger: Logger) {
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

export function getLogger(): Logger {
  return (asyncLocalStorage.getStore()?.get('logger') as Logger) ?? initialLogger;
}
