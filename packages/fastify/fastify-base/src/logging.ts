import { getPerRequestLogger } from '@repo/fastify-logging';

export type { Logger } from '@repo/logging';
export const logger = {
  get instance() {
    return getPerRequestLogger();
  }
};
