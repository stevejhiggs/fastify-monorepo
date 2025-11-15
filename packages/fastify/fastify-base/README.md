# @repo/fastify-base

A production-ready Fastify setup package that combines all essential plugins into a single, easy-to-use configuration. Perfect for getting started quickly while maintaining flexibility.

## Features

- **All-in-One Setup** - Pre-configured with security, logging, validation, and documentation
- **Zod Integration** - Type-safe request/response validation
- **Swagger Documentation** - Automatic OpenAPI docs at `/documentation`
- **Request-Scoped Logging** - Persistent logger available throughout request lifecycle
- **Security Headers** - Helmet integration for security best practices
- **Type-Safe** - Full TypeScript support with enhanced Fastify types

## Installation

```bash
pnpm add @repo/fastify-base fastify zod
```

## Quick Start

```typescript
import { setupBaseApp } from '@repo/fastify-base';

const { app } = await setupBaseApp({
  port: 3000,
  logger: {
    logLevel: 'info'
  },
  swagger: {
    enable: true,
    title: 'My API',
    version: '1.0.0'
  }
});

// Define routes with Zod schemas
app.get('/users/:id', {
  schema: {
    params: z.object({
      id: z.string()
    }),
    response: {
      200: z.object({
        id: z.string(),
        name: z.string()
      })
    }
  }
}, async (request, reply) => {
  const { id } = request.params;
  return { id, name: 'John Doe' };
});

await app.listen({ port: 3000 });
```

## What's Included

This package automatically sets up:

1. **Zod Validation** (`@repo/fastify-zod`) - Type-safe request/response validation
2. **Swagger Documentation** (`@repo/fastify-swagger`) - OpenAPI docs at `/documentation`
3. **Security Headers** (`@repo/fastify-security`) - Helmet security headers
4. **Request Logging** (`@repo/fastify-logging`) - Per-request logger
5. **Structured Logging** (`@repo/logging`) - Pino-based logging with GCP support

## API

### `setupBaseApp(config)`

Creates and configures a Fastify instance with all plugins.

**Config:**
```typescript
type FastifyBaseConfig = {
  port: number;
  swagger: {
    enable: boolean;
    title?: string;
    version?: string;
  };
  logger?: {
    outputFormat?: 'DEFAULT' | 'GCP';
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  };
};
```

**Returns:** `Promise<{ app: EnhancedFastifyInstance }>`

### Enhanced Fastify Instance

The returned app has enhanced TypeScript types with:
- Zod type provider for schema validation
- Request-scoped logger access
- All Fastify plugins registered

## Usage Examples

### Basic API Setup

```typescript
import { setupBaseApp } from '@repo/fastify-base';
import { z } from 'zod';

const { app } = await setupBaseApp({
  port: 3000,
  logger: { logLevel: 'info' },
  swagger: {
    enable: true,
    title: 'User API',
    version: '1.0.0'
  }
});

app.get('/health', async () => {
  return { status: 'ok' };
});

await app.listen({ port: 3000 });
```

### Using Request-Scoped Logger

```typescript
import { logger } from '@repo/fastify-base/logging';

app.get('/users/:id', async (request) => {
  // Access logger from anywhere in your request handler
  logger.instance.info({ userId: request.params.id }, 'Fetching user');
  
  // Your logic here
  return { id: request.params.id, name: 'John' };
});
```

### Using Caching

```typescript
import { createInMemoryCache } from '@repo/fastify-base/caching';

const cache = createInMemoryCache({
  ttl: 3600,
  maxSize: 1000
});

app.get('/users/:id', async (request) => {
  const cacheKey = `user:${request.params.id}`;
  const cached = await cache.getItem(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const user = await fetchUser(request.params.id);
  await cache.setItem(cacheKey, user);
  return user;
});
```

### Environment-Based Configuration

```typescript
const { app } = await setupBaseApp({
  port: Number(process.env.PORT) || 3000,
  logger: {
    outputFormat: process.env.NODE_ENV === 'production' ? 'GCP' : 'DEFAULT',
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  swagger: {
    enable: process.env.DISABLE_DOCS !== 'true',
    title: 'My API',
    version: '1.0.0'
  }
});
```

## Exports

### Main Export

```typescript
import { setupBaseApp, type EnhancedFastifyInstance } from '@repo/fastify-base';
```

### Caching Utilities

```typescript
import { createInMemoryCache, createRedisCache } from '@repo/fastify-base/caching';
```

### Logging Utilities

```typescript
import { logger } from '@repo/fastify-base/logging';
```

## Individual Packages

If you need more control, you can use the individual packages:

- `@repo/fastify-zod` - Zod validation only
- `@repo/fastify-swagger` - Swagger documentation only
- `@repo/fastify-security` - Security headers only
- `@repo/fastify-logging` - Request logging only

## Testing

```bash
pnpm typecheck
```

## License

ISC
