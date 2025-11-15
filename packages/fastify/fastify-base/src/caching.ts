// connect the caching package to the per-request logger

import {
  createInMemoryCache as baseCreateInMemoryCache,
  createRedisCache as baseCreateRedisCache,
  type Cache,
  type InMemoryCacheOptions,
  type RedisCacheOptions
} from '@repo/caching';
import { logger } from './logging';

export type { Cache } from '@repo/caching';

export function createInMemoryCache(args: Omit<InMemoryCacheOptions, 'onError'>): Cache {
  return baseCreateInMemoryCache({ ...args, onError: (error) => logger.instance.error({ message: 'Error caching item', err: error }) });
}

export function createRedisCache(args: Omit<RedisCacheOptions, 'onError'>): Cache {
  return baseCreateRedisCache({ ...args, onError: (error) => logger.instance.error({ message: 'Error caching item', err: error }) });
}
