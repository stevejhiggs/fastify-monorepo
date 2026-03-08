# @repo/fastify-base

Combines all Fastify plugins into a single production-ready instance. The main entry point for building APIs in this monorepo.

## Installation

This package is part of the monorepo. Add it as a workspace dependency:

```json
{
  "dependencies": {
    "@repo/fastify-base": "workspace:*"
  }
}
```

## Quick Start

```typescript
import { setupBaseApp } from '@repo/fastify-base';

const { app } = await setupBaseApp({
  port: 3000,
  serviceInfo: { name: 'My API', version: '1.0.0' },
  swagger: { enable: true },
  logger: { logLevel: 'info' }
});

app.get('/health', async () => ({ status: 'ok' }));

await app.listen({ port: 3000 });
```

## What's Included

`setupBaseApp` registers these plugins in order:

1. **Zod** (`@repo/fastify-zod`) — type-safe request/response validation
2. **Multipart** (`@repo/fastify-multipart`) — file upload support (100MB limit by default)
3. **Security** (`@repo/fastify-security`) — Helmet security headers
4. **Auth** (`@repo/fastify-auth`) — optional, when `auth` providers are configured
5. **Swagger** (`@repo/fastify-swagger`) — OpenAPI docs at `/documentation`

Request-scoped logging is set up via `@repo/fastify-observability`.

## API

### `setupBaseApp(config): Promise<{ app: EnhancedFastifyInstance }>`

**Config:**

```typescript
type FastifyBaseConfig = {
  port: number;
  serviceInfo: {
    name: string; // Used as API title in Swagger
    version: string; // Used as API version in Swagger
  };
  swagger: {
    enable: boolean;
    host?: string; // default: 'localhost'
    documentationRoute?: string; // default: '/documentation'
  };
  logger?: {
    outputFormat?: 'DEFAULT' | 'GCP'; // default: 'DEFAULT'
    logLevel?: string; // default: 'info'
  };
  auth?: AuthProvider[]; // from @repo/fastify-auth
};
```

## Usage Examples

### With authentication

```typescript
import { setupBaseApp } from '@repo/fastify-base';
import { jwtProvider } from '@repo/fastify-auth-jwt';

const { app } = await setupBaseApp({
  port: 3000,
  serviceInfo: { name: 'My API', version: '1.0.0' },
  swagger: { enable: true },
  auth: [jwtProvider({ secret: process.env.JWT_SECRET })]
});

app.get('/me', { preHandler: [app.authenticate] }, async (request) => {
  return request.user;
});
```

### GCP production config

```typescript
const { app } = await setupBaseApp({
  port: Number(process.env.PORT) || 3000,
  serviceInfo: { name: 'My API', version: process.env.npm_package_version ?? '0.0.0' },
  logger: {
    outputFormat: process.env.NODE_ENV === 'production' ? 'GCP' : 'DEFAULT',
    logLevel: process.env.LOG_LEVEL ?? 'info'
  },
  swagger: { enable: process.env.DISABLE_DOCS !== 'true' }
});
```

### Request-scoped logger

```typescript
import { logger } from '@repo/fastify-base/logging';

app.get('/users/:id', async (request) => {
  logger.instance.info({ userId: request.params.id }, 'Fetching user');
  return { id: request.params.id };
});
```

### Caching

```typescript
import { createInMemoryCache } from '@repo/fastify-base/caching';

const cache = createInMemoryCache({ ttl: 3600, maxSize: 1000 });

app.get('/users/:id', async (request) => {
  const key = `user:${request.params.id}`;
  return (await cache.getItem(key)) ?? fetchAndCache(key);
});
```

## Exports

```typescript
// Main
import { setupBaseApp, type FastifyBaseConfig, type EnhancedFastifyInstance } from '@repo/fastify-base';

// Caching utilities
import { createInMemoryCache, createRedisCache } from '@repo/fastify-base/caching';

// Request-scoped logger
import { logger } from '@repo/fastify-base/logging';

// Multipart helpers
import { registerMultipart } from '@repo/fastify-base/multipart';

// OpenTelemetry setup
import { setupOpenTelemetry } from '@repo/fastify-base/telemetry/setup';
```

## Individual Packages

For more control, import plugins directly:

- [`@repo/fastify-zod`](../fastify-zod/README.md) — Zod validation only
- [`@repo/fastify-swagger`](../fastify-swagger/README.md) — Swagger docs only
- [`@repo/fastify-security`](../fastify-security/README.md) — Security headers only
- [`@repo/fastify-observability`](../fastify-observability/README.md) — Request logging only
- [`@repo/fastify-auth`](../fastify-auth/README.md) — Auth decorators only
