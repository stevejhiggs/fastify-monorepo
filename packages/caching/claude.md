# @repo/caching

Unified caching abstraction supporting in-memory and Redis backends.

## Exports

```typescript
import { createInMemoryCache, createRedisCache } from '@repo/caching';
import type { Cache, CacheOptions, RedisCacheOptions } from '@repo/caching';
```

## Usage

### In-Memory Cache

```typescript
const cache = createInMemoryCache({
  ttl: 60_000, // 60 seconds default TTL
  max: 1000 // Max entries
});

await cache.set('key', { data: 'value' });
const result = await cache.get('key');
await cache.delete('key');
await cache.clear();
```

### Redis Cache (Layered)

Creates a two-tier cache: in-memory L1 + Redis L2.

```typescript
const cache = createRedisCache({
  redisUrl: process.env.REDIS_URL,
  ttl: 300_000, // 5 minutes
  max: 500 // L1 cache max entries
});
```

## Key Implementation Details

- Uses `cacheable` library for cache abstraction
- `keyv` adapters for Redis connectivity
- `superjson` for serialization (supports Date, Map, Set, etc.)
- Graceful fallback if Redis unavailable

## Cache Interface

```typescript
interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
}
```

## Testing

Mock the cache interface in tests rather than using real Redis. The in-memory cache works well for integration tests.
