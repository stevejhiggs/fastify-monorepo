import KeyvRedis from '@keyv/redis';
import { Cacheable, KeyvCacheableMemory } from 'cacheable';
import SuperJSON from 'superjson';

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
  maxSize: number;
};

function serializeValue<T>(value: T | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return SuperJSON.stringify(value);
}

function deserializeValue<T>(value: string | undefined): T | undefined {
  if (value === undefined) {
    return undefined;
  }
  return SuperJSON.parse(value);
}

function createCacheAdapter(cache: Cacheable, onError: CacheErrorHandler): Cache {
  cache.on('error', onError);

  return {
    getItem: async <T>(key: string) => {
      const value = await cache.get<T | string>(key);
      if (typeof value === 'string') {
        return deserializeValue<T>(value);
      }
      return value;
    },
    setItem: async <T>(key: string, value: T) => {
      const serializedValue = serializeValue(value);
      if (serializedValue === undefined) {
        return;
      }
      await cache.set(key, serializedValue);
    },
    deleteItem: async (key: string) => {
      await cache.delete(key);
    },
    clear: async () => {
      await cache.clear();
    }
  };
}

export function createInMemoryCache(args: CacheOptions): Cache {
  const cache = new KeyvCacheableMemory({ ttl: args.ttl, lruSize: args.maxSize });
  const cacheable = new Cacheable({ primary: cache });

  return createCacheAdapter(cacheable, args.onError);
}

export type RedisCacheOptions = CacheOptions & { connection: string };

export function createRedisCache(args: RedisCacheOptions): Cache {
  const inMemoryCache = new KeyvCacheableMemory({ ttl: args.ttl, lruSize: args.maxSize });
  const redisCache = new KeyvRedis(args.connection);
  redisCache.on('error', args.onError);

  const cache = new Cacheable({
    primary: inMemoryCache,
    secondary: redisCache
  });
  return createCacheAdapter(cache, args.onError);
}
