# @repo/fastify-base

Main entry point that combines all Fastify plugins into a production-ready instance.

## Exports

```typescript
import { setupBaseApp } from '@repo/fastify-base';
import type { FastifyBaseConfig, EnhancedFastifyInstance } from '@repo/fastify-base';

// Sub-exports for advanced usage
import { createInMemoryCache, createRedisCache } from '@repo/fastify-base/caching';
import { initLogger } from '@repo/fastify-base/logging';
import { setupOpenTelemetry } from '@repo/fastify-base/telemetry/setup';
```

## Usage

```typescript
const app = await setupBaseApp({
  logger: {
    level: 'info',
    format: 'default'
  },
  swagger: {
    title: 'My API',
    version: '1.0.0',
    description: 'API description'
  },
  multipart: {
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
  }
});
```

## What It Includes

`setupBaseApp` registers these plugins in order:

1. **Zod** - Type-safe schema validation
2. **Sensible** - HTTP error utilities (`reply.notFound()`, `app.httpErrors.conflict()`, etc.)
3. **Multipart** - File upload support
4. **Security** - Helmet security headers
5. **Rate Limit** - Request rate limiting (optional, configured via `rateLimit`)
6. **Auth** - Authentication providers (optional, configured via `auth`)
7. **Swagger** - OpenAPI documentation at `/documentation`
8. **Observability** - Request logging and correlation IDs

## Configuration

```typescript
interface FastifyBaseConfig {
  port: number;
  serviceInfo: {
    name: string;
    version: string;
  };
  swagger: SwaggerConfig;
  logger?: LoggerConfig;
  auth?: AuthProvider[];
  rateLimit?: RateLimitPluginOptions;
}
```

## EnhancedFastifyInstance

The returned instance is fully typed with:

- Zod type provider for request/response schemas
- All plugin decorators
- Request logging context

```typescript
// Routes automatically infer types from Zod schemas
app.post('/users', {
  schema: {
    body: z.object({ name: z.string() }),
    response: { 200: z.object({ id: z.string() }) }
  },
  handler: async (request, reply) => {
    const { name } = request.body; // typed as string
    return { id: '123' };
  }
});
```

## Extending

If you need custom plugin order or configuration, import individual plugins:

```typescript
import Fastify from 'fastify';
import { registerZod } from '@repo/fastify-zod';
import { registerSecurity } from '@repo/fastify-security';

const app = registerZod(Fastify());
const secureApp = registerSecurity(app);
```
