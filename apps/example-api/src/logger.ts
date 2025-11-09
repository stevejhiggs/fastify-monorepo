import { initLogger } from '@repo/fastify-base';

// give access to an instance of the logger from anywhere that needs it.
// if you are logging as part of a request you are better off using the request level
// logger as this will ensure all the logs get the same request id
export const logger = initLogger({
  logLevel: process.env['LOG_LEVEL']
});
