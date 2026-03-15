# Example API

Reference implementation demonstrating all `@repo/fastify-*` packages.

## Purpose

This app serves as:

- Working example of the monorepo's Fastify setup
- Integration test for all plugins working together
- Starting point for new API applications

## Structure

```
src/
  index.ts          # Entry point (imports listener)
  listener.ts       # Network listener setup
  server.ts         # Fastify instance factory
  routes/           # Route handlers organized by feature
    index.ts        # Route registry
    health.ts       # Health check endpoints
    example.ts      # Example routes with validation
```

## Key Patterns

### Server Setup

`server.ts` creates the Fastify instance using `@repo/fastify-base`:

```typescript
import { setupBaseApp } from '@repo/fastify-base';

export async function createServer() {
  const app = await setupBaseApp({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
    swagger: { title: 'Example API', version: '1.0.0' }
  });

  await registerRoutes(app);
  return app;
}
```

### Route Organization

Routes are registered through a central registry in `routes/index.ts`. Each route file exports a registration function.

### Request Schemas

Use Zod for request/response validation:

```typescript
import { z } from 'zod';

const querySchema = z.object({
  limit: z.coerce.number().optional().default(10)
});

app.get('/items', {
  schema: { querystring: querySchema },
  handler: async (request) => {
    const { limit } = request.query; // typed!
  }
});
```

## Running

```bash
# Development with hot reload
pnpm dev

# With OpenTelemetry
pnpm dev:with-telemetry

# Production
pnpm build && pnpm start
```

## Adding Routes

1. Create route file in `src/routes/`
2. Export async registration function
3. Import and call in `routes/index.ts`

## Observability

- Logs automatically include `traceId` and `spanId` when OpenTelemetry is enabled (run with `pnpm dev:with-telemetry`)
- Use `withSpan` from `@repo/open-telemetry` to create custom spans with automatic error recording:
  ```typescript
  import { withSpan } from '@repo/open-telemetry';
  const result = await withSpan('operationName', async (span) => {
    span.setAttribute('key', 'value');
    return doWork();
  });
  ```

## Environment Variables

- `LOG_LEVEL` - Logger level (default: `info`)
- `PORT` - Server port (default: `3000`)
- `DISABLE_DOCS` - Disable `/documentation` endpoint
- `REDIS_URL` - Enable Redis caching
