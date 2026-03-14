// connect the caching package to the per-request logger

import { createInMemoryCache as baseCreateInMemoryCache, createRedisCache as baseCreateRedisCache, type Cache, type CacheOptions, type RedisCacheOptions } from '@repo/caching';

import { logger } from './logging';

export type { Cache } from '@repo/caching';

const onError = (error: unknown) => logger.instance.error({ message: 'Error caching item', err: error });

export function createInMemoryCache(args: Omit<CacheOptions, 'onError'>): Cache {
  return baseCreateInMemoryCache({ ...args, onError });
}

export function createRedisCache(args: Omit<RedisCacheOptions, 'onError'>): Cache {
  return baseCreateRedisCache({ ...args, onError });
}
