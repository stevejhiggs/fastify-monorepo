# @repo/logging

Pino-based structured logging with GCP support.

## Exports

```typescript
import { initLogger } from "@repo/logging";
import type { Logger, LoggerConfig } from "@repo/logging";
```

## Usage

```typescript
const logger = initLogger({
  level: "info",
  format: "default", // or "gcp" for Google Cloud
});

logger.info("Server started");
logger.error({ err, requestId }, "Request failed");
logger.debug({ data }, "Processing item");
```

## Configuration

```typescript
interface LoggerConfig {
  level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  format?: "default" | "gcp";
}
```

- `default` - Standard Pino JSON output (pretty-printed in dev with pino-pretty)
- `gcp` - Google Cloud Logging format with severity mapping

## Structured Logging

Always include context objects:

```typescript
// Good - structured
logger.info({ userId, action: "login" }, "User logged in");

// Avoid - unstructured
logger.info(`User ${userId} logged in`);
```

## Integration with Fastify

The logger is passed to Fastify and automatically adds request context:

```typescript
// In route handler
request.log.info({ orderId }, "Processing order");
// Automatically includes requestId, method, url
```

## Log Levels

Use appropriate levels:
- `error` - Errors requiring attention
- `warn` - Unexpected but handled situations
- `info` - Normal operations (startup, requests)
- `debug` - Development troubleshooting
- `trace` - Verbose debugging
