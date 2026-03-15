# @repo/open-telemetry

OpenTelemetry SDK setup with configurable exporters for traces and metrics.

## Exports

```typescript
import { setupOpenTelemetry } from '@repo/open-telemetry';
import type { MetricExporter, TraceExporter, OpenTelemetryConfig } from '@repo/open-telemetry';
```

## Usage

**Must be called before importing other modules** (typically in a separate entry file):

```typescript
// telemetry.ts - imported first
import { setupOpenTelemetry } from '@repo/open-telemetry';

setupOpenTelemetry({
  serviceName: 'my-api',
  traceExporter: 'otlp-http',
  metricExporter: 'otlp-proto'
});
```

```typescript
// index.ts
import './telemetry.js';
import { createServer } from './server.js';
```

## Exporter Options

### Trace Exporters

- `otlp-http` - OTLP over HTTP (default for most collectors)
- `otlp-grpc` - OTLP over gRPC
- `console` - Print to stdout (debugging)
- `none` - Disable tracing

### Metric Exporters

- `otlp-proto` - OTLP with protobuf encoding
- `otlp-grpc` - OTLP over gRPC
- `console` - Print to stdout
- `none` - Disable metrics

## Auto-Instrumentation

Automatically instruments:

- HTTP client/server requests
- Node.js core modules
- Undici (fetch)

## Environment Variables

Standard OTEL env vars are supported:

- `OTEL_EXPORTER_OTLP_ENDPOINT` - Collector endpoint
- `OTEL_SERVICE_NAME` - Service name override
- `OTEL_RESOURCE_ATTRIBUTES` - Additional resource attributes

## withSpan

Wraps a function in a span with automatic error recording, status setting, and `span.end()`:

```typescript
import { withSpan } from '@repo/open-telemetry';

const user = await withSpan('getUser', async (span) => {
  span.setAttribute('userId', id);
  return db.users.findById(id);
});

// With options (kind, attributes, custom tracer name)
await withSpan('sendEmail', sendFn, {
  kind: SpanKind.CLIENT,
  attributes: { 'email.to': addr },
  tracerName: 'my-library'
});
```

On success the span gets status OK. On error it records the exception, sets status ERROR, and re-throws. The span is always ended.

Also re-exports `Span`, `SpanOptions`, `SpanStatusCode`, and `SpanKind` from `@opentelemetry/api` for convenience.

## Graceful Shutdown

The SDK registers shutdown handlers automatically. Spans and metrics are flushed on process exit.

## Development

Use `console` exporters during development to see traces/metrics:

```typescript
setupOpenTelemetry({
  serviceName: 'my-api',
  traceExporter: 'console',
  metricExporter: 'none'
});
```
