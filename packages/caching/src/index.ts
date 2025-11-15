import KeyvRedis from '@keyv/redis';
import { Cacheable, CacheableMemory } from 'cacheable';

type CacheErrorHandler = (error: unknown) => void;

export type Cache = {
  getItem<T>(key: string): Promise<T | undefined>;
  setItem<T>(key: string, value: T): Promise<void>;
  deleteItem(key: string): Promise<void>;
  clear(): Promise<void>;
};

export type CacheOptions = {
  ttl: string | number;
  onError: CacheErrorHandler;
};

export function createInMemoryCache(args: CacheOptions & { maxSize: number }): Cache {
  new Cacheable({});
  const cache = new CacheableMemory({ ttl: args.ttl, lruSize: args.maxSize });
  cache.on('error', args.onError);

  return {
    getItem: async <T>(key: string) => {
      return cache.get<T>(key);
    },
    setItem: async <T>(key: string, value: T) => {
      return cache.set(key, value);
    },
    deleteItem: async (key: string) => {
      return cache.delete(key);
    },
    clear: async () => {
      return cache.clear();
    }
  };
}

export function createRedisCache(args: CacheOptions & { connection: string }): Cache {
  // fall back to redis
  const redisCache = new KeyvRedis(args.connection);
  redisCache.on('error', args.onError);

  const cache = new Cacheable({
    ttl: args.ttl,
    secondary: redisCache
  });
  cache.on('error', args.onError);

  return {
    getItem: async <T>(key: string) => {
      return cache.get<T>(key);
    },
    setItem: async <T>(key: string, value: T) => {
      cache.set<T>(key, value);
    },
    deleteItem: async (key: string) => {
      cache.delete(key);
    },
    clear: async () => {
      cache.clear();
    }
  };
}
