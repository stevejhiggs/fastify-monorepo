# withSpan Utility & Log-Trace Correlation

**Date:** 2026-03-15
**Status:** Draft

## Problem

Two gaps exist in the observability stack:

1. Every call to `tracer.startActiveSpan` requires ~10 lines of boilerplate for error recording, status setting, and `span.end()`. There is no higher-level wrapper in the OpenTelemetry JS SDK.
2. Log lines from Pino contain no trace context. You cannot click from a log line to its distributed trace without manually correlating timestamps.

## Scope

- **In scope:** `withSpan` utility function, automatic `traceId`/`spanId` injection into per-request logs.
- **Out of scope:** Full flow context (initiator/caller/entryPoint), decorators, custom metrics helpers, sampling strategies.

## Design

### 1. `withSpan` in `@repo/open-telemetry`

A single exported function added to `packages/open-telemetry/src/index.ts`.

```typescript
import { trace, SpanStatusCode, type Span, type SpanOptions } from '@opentelemetry/api';

const DEFAULT_TRACER_NAME = 'app';

export async function withSpan<T>(name: string, fn: (span: Span) => Promise<T> | T, options?: SpanOptions & { tracerName?: string }): Promise<T> {
  const { tracerName = DEFAULT_TRACER_NAME, ...spanOptions } = options ?? {};
  const tracer = trace.getTracer(tracerName);

  return tracer.startActiveSpan(name, spanOptions, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (err as Error).message
      });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

**Behavior:**

- Creates a span, sets it as the active span in context, runs `fn`.
- On success: sets status OK, ends span, returns result.
- On error: records exception, sets status ERROR, ends span, re-throws.
- The `span` argument lets callers add attributes/events without managing lifecycle.
- `tracerName` defaults to `'app'`; override for library-specific tracers.
- Works outside Fastify (e.g., Temporal workers, scripts) since it only depends on `@opentelemetry/api`.

**Re-exports to add:** `Span`, `SpanOptions`, `SpanStatusCode`, `SpanKind` from `@opentelemetry/api` for convenience so consumers don't need a direct dependency on `@opentelemetry/api`.

### 2. Log-trace correlation in `@repo/fastify-observability`

Modify `packages/fastify/fastify-observability/src/logging.ts` to inject trace context into the per-request child logger.

**Current code:**

```typescript
defaultStoreValues: (request) => ({
  logger: request.log.child({})
});
```

**New code:**

```typescript
import { trace } from '@opentelemetry/api';

defaultStoreValues: (request) => {
  const spanContext = trace.getActiveSpan()?.spanContext();
  return {
    logger: request.log.child({
      ...(spanContext && {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId
      })
    })
  };
};
```

**Behavior:**

- If OTel is initialized and a span is active (which `@fastify/otel` creates for each request), `traceId` and `spanId` appear on every log line for that request.
- If OTel is not initialized, `trace.getActiveSpan()` returns `undefined` and the logger is created without trace fields. No breakage.
- `@opentelemetry/api` becomes an explicit dependency of `@repo/fastify-observability` (already an indirect dependency via `@repo/open-telemetry`).

**Example log output:**

```json
{
  "level": 30,
  "time": 1710500000000,
  "traceId": "abc123def456...",
  "spanId": "789abc...",
  "msg": "message from outer function"
}
```

### 3. Updates to example app, templates, and docs

#### Example app (`apps/example-api/`)

Update `src/routes/logging/route.ts` to demonstrate `withSpan` alongside the existing logger demo:

```typescript
import { logger } from '@repo/fastify-base/logging';
import { withSpan } from '@repo/open-telemetry';

async function fetchUserData(userId: string) {
  return withSpan('fetchUserData', async (span) => {
    span.setAttribute('userId', userId);
    logger.instance.info({ userId }, 'fetching user data');
    // simulate work
    return { id: userId, name: 'Example User' };
  });
}

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.get('/logging', async (_req, reply) => {
    const user = await fetchUserData('user-123');
    logger.instance.info({ user }, 'request complete');
    reply.send('OK');
  });
}
```

This demonstrates: nested span creation, attributes on spans, and correlated log lines (traceId/spanId appear automatically).

#### Templates (`tooling/templates/`)

**`api/src/routes/logging/route.ts`** — Same pattern as the example app update above. Show `withSpan` wrapping a function call with correlated logs.

**`api/src/routes/metrics/route.ts`** — Wrap the existing metrics handler body in `withSpan` to show spans and custom metrics working together.

**`api/claude.md`** — Add a section noting:

- `withSpan` is available from `@repo/open-telemetry` for custom span creation
- Logs automatically include `traceId`/`spanId` when OTel is enabled

**`api/README.md`** — Add brief mention of trace-correlated logs in the observability section.

**`temporal-app/claude.md.hbs`** — Note that `withSpan` can be used in activities for custom spans.

**`temporal-app/README.md.hbs`** — Mention `withSpan` availability in the telemetry section.

#### Package-level docs

**`@repo/open-telemetry`** — JSDoc on the `withSpan` export documenting signature, behavior, and usage example.

**`@repo/fastify-observability`** — JSDoc comment in `logging.ts` noting that `traceId`/`spanId` are auto-injected when OTel is active.

## Dependencies

| Package                       | New dependency                  | Reason                                                          |
| ----------------------------- | ------------------------------- | --------------------------------------------------------------- |
| `@repo/open-telemetry`        | None                            | Already depends on `@opentelemetry/api`                         |
| `@repo/fastify-observability` | `@opentelemetry/api` (explicit) | Already indirect via `@repo/open-telemetry`; making it explicit |

## Testing

- **`@repo/open-telemetry`**: Unit test for `withSpan` — verify span creation, error recording, status codes, and that the span is ended in both success and error paths. Use `@opentelemetry/sdk-trace-base` `InMemorySpanExporter` for assertions.
- **`@repo/fastify-observability`**: Unit test that when OTel is active, the per-request logger includes `traceId` and `spanId` bindings. Test that when OTel is not active, logger works without trace fields.

## Files Changed

| File                                                         | Change                                                                                 |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `packages/open-telemetry/src/index.ts`                       | Add `withSpan` function, re-export `Span`, `SpanOptions`, `SpanStatusCode`, `SpanKind` |
| `packages/open-telemetry/src/with-span.ts`                   | New file for `withSpan` implementation (keep index.ts clean)                           |
| `packages/open-telemetry/src/with-span.test.ts`              | Unit tests for `withSpan`                                                              |
| `packages/open-telemetry/package.json`                       | Add `@opentelemetry/sdk-trace-base` as dev dependency for testing                      |
| `packages/fastify/fastify-observability/src/logging.ts`      | Inject `traceId`/`spanId` into child logger                                            |
| `packages/fastify/fastify-observability/src/logging.test.ts` | Test trace correlation in logs                                                         |
| `packages/fastify/fastify-observability/package.json`        | Add explicit `@opentelemetry/api` dependency                                           |
| `apps/example-api/src/routes/logging/route.ts`               | Demonstrate `withSpan` + correlated logs                                               |
| `tooling/templates/api/src/routes/logging/route.ts`          | Same `withSpan` demo pattern                                                           |
| `tooling/templates/api/src/routes/metrics/route.ts`          | Wrap handler in `withSpan`                                                             |
| `tooling/templates/api/claude.md`                            | Document `withSpan` and trace-correlated logs                                          |
| `tooling/templates/api/README.md`                            | Brief observability mention                                                            |
| `tooling/templates/temporal-app/claude.md.hbs`               | Note `withSpan` for activities                                                         |
| `tooling/templates/temporal-app/README.md.hbs`               | Mention `withSpan` in telemetry section                                                |
