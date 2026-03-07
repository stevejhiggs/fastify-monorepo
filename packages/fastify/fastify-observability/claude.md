# @repo/fastify-observability

Request logging and OpenTelemetry integration for Fastify.

## Exports

```typescript
import { registerObservability } from '@repo/fastify-observability';

// Sub-exports
import { initLogger } from '@repo/fastify-observability/logging';
import { setupOpenTelemetry } from '@repo/fastify-observability/open-telemetry';
```

## Usage

```typescript
import { registerObservability } from '@repo/fastify-observability';

const app = await registerObservability(fastifyInstance, {
  logger: {
    level: 'info',
    format: 'default'
  }
});
```

## What It Provides

### Request Logging

- Automatic request/response logging
- Correlation IDs for request tracing
- Structured log context

### Request Context

Each request gets:

- `request.log` - Scoped logger with request context
- Request ID in headers and logs
- Timing information

## Using Request Logger

```typescript
app.get('/users/:id', async (request) => {
  request.log.info({ userId: request.params.id }, 'Fetching user');

  try {
    const user = await getUser(request.params.id);
    request.log.debug({ user }, 'User found');
    return user;
  } catch (err) {
    request.log.error({ err }, 'Failed to fetch user');
    throw err;
  }
});
```

## OpenTelemetry Integration

When OTEL is configured (via `@repo/open-telemetry`), this plugin:

- Correlates logs with trace IDs
- Adds span context to requests
- Enables distributed tracing

## Log Output

Request logs include:

```json
{
  "level": "info",
  "time": 1234567890,
  "requestId": "abc-123",
  "method": "GET",
  "url": "/users/1",
  "statusCode": 200,
  "responseTime": 42,
  "msg": "request completed"
}
```

## Configuration

```typescript
interface ObservabilityConfig {
  logger?: {
    level?: string;
    format?: 'default' | 'gcp';
  };
}
```
