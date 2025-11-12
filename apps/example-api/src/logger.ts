import type { Logger } from '@repo/fastify-base';
import type { LoggerConfig } from '../../../packages/logging/src/logging';

export const loggerConfig: LoggerConfig = {
  logLevel: process.env['LOG_LEVEL']
};

// give access to an instance of the logger from anywhere that needs it.
// if you are logging as part of a request you are better off using the request level
// logger as this will ensure all the logs get the same request id
export let logger: Logger;

export function setLogger(instance: Logger) {
  logger = instance;
}
