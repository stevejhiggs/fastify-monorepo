import { getPerRequestLogger } from '@repo/fastify-observability/logging';

export type { Logger } from '@repo/logging';
export const logger = {
  get instance() {
    return getPerRequestLogger();
  }
};
