# @repo/caching

A flexible caching solution with in-memory and Redis support, featuring SuperJSON serialization for proper handling of complex types like dates, Maps, Sets, and more.

## Features

- **In-Memory Caching** - Fast LRU cache with configurable TTL and max size
- **Redis Support** - Optional Redis secondary cache for distributed caching
- **SuperJSON Serialization** - Proper serialization of dates, Maps, Sets, and other complex types
- **Type-Safe** - Full TypeScript support with generic types

## Installation

```bash
pnpm add @repo/caching
```

## Usage

### In-Memory Cache

```typescript
import { createInMemoryCache } from '@repo/caching';

const cache = createInMemoryCache({
  ttl: 3600, // Time to live in seconds
  maxSize: 1000, // Maximum number of items
  onError: (error) => {
    console.error('Cache error:', error);
  }
});

// Store a value
await cache.setItem('user:123', { id: 123, name: 'John', createdAt: new Date() });

// Retrieve a value
const user = await cache.getItem<{ id: number; name: string; createdAt: Date }>('user:123');

// Delete a value
await cache.deleteItem('user:123');

// Clear all cache
await cache.clear();
```

### Redis Cache

```typescript
import { createRedisCache } from '@repo/caching';

const cache = createRedisCache({
  ttl: 3600, // Time to live in seconds
  connection: 'redis://localhost:6379', // Redis connection string
  onError: (error) => {
    console.error('Redis cache error:', error);
  }
});

// Use the same API as in-memory cache
await cache.setItem('key', { data: 'value', date: new Date() });
const value = await cache.getItem<{ data: string; date: Date }>('key');
```

### Redis with In-Memory Fallback

The Redis cache implementation uses a two-tier caching strategy:
1. Primary: In-memory cache (fast access)
2. Secondary: Redis cache (distributed, persistent)

This provides the best of both worlds - fast local access with distributed cache support.

## API

### `Cache` Interface

```typescript
type Cache = {
  getItem<T>(key: string): Promise<T | undefined>;
  setItem<T>(key: string, value: T): Promise<void>;
  deleteItem(key: string): Promise<void>;
  clear(): Promise<void>;
};
```

### `createInMemoryCache(options)`

Creates an in-memory LRU cache.

**Options:**
- `ttl: string | number` - Time to live in seconds
- `maxSize: number` - Maximum number of items in cache
- `onError: (error: unknown) => void` - Error handler

### `createRedisCache(options)`

Creates a Redis-backed cache with in-memory fallback.

**Options:**
- `ttl: string | number` - Time to live in seconds
- `connection: string` - Redis connection string
- `onError: (error: unknown) => void` - Error handler

## SuperJSON Support

This package uses SuperJSON for serialization, which means you can safely cache:

- Dates (preserved as Date objects, not strings)
- Maps and Sets
- Regular expressions
- BigInt values
- Undefined values
- And more complex nested structures

## Example: Caching API Responses

```typescript
import { createInMemoryCache } from '@repo/caching';

const cache = createInMemoryCache({
  ttl: 300, // 5 minutes
  maxSize: 100,
  onError: (error) => console.error('Cache error:', error)
});

async function getCachedUser(userId: string) {
  const cacheKey = `user:${userId}`;
  
  // Try cache first
  const cached = await cache.getItem<{ id: string; name: string }>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from API
  const user = await fetchUserFromAPI(userId);
  
  // Store in cache
  await cache.setItem(cacheKey, user);
  
  return user;
}
```

## Testing

```bash
pnpm test
```

## License

ISC
