# @repo/open-telemetry

A comprehensive OpenTelemetry setup package for Node.js applications. This package provides a simple, configurable way to initialize OpenTelemetry instrumentation with support for multiple exporters, automatic instrumentations, and graceful shutdown handling.

## Installation

```bash
pnpm add @repo/open-telemetry
```

## Quick Start

```typescript
import { setupOpenTelemetry } from '@repo/open-telemetry';

setupOpenTelemetry({
  serviceInfo: {
    name: 'my-service',
    version: '1.0.0'
  },
  traces: {
    exporter: 'otlp-grpc',
    endpoint: 'http://localhost:4317'
  },
  metrics: {
    exporter: 'otlp-grpc',
    endpoint: 'http://localhost:4317',
    intervalMillis: 5000
  },
  logLevel: 'info'
});
```

**Important**: Call `setupOpenTelemetry` at the very beginning of your application, before importing any other modules that should be instrumented.

## Configuration

### `OpenTelemetryParams`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceInfo` | `{ name: string; version: string }` | Yes | Service identification for telemetry |
| `traces.exporter` | `TraceExporter` | Yes | Trace exporter type (see below) |
| `traces.endpoint` | `string` | No | OTLP endpoint for traces (defaults based on exporter) |
| `metrics.exporter` | `MetricsExporter` | Yes | Metrics exporter type (see below) |
| `metrics.endpoint` | `string` | No | OTLP endpoint for metrics (defaults based on exporter) |
| `metrics.intervalMillis` | `number` | No | Metrics export interval in milliseconds (default: 5000) |
| `instrumentations` | `Instrumentation[]` | No | Additional OpenTelemetry instrumentations |
| `logLevel` | `string` | No | OpenTelemetry diagnostic log level (default: 'info') |

### Trace Exporters

- `'otlp-http'`: OTLP over HTTP (default endpoint: `http://localhost:4318`)
- `'otlp-grpc'`: OTLP over gRPC (default endpoint: `http://localhost:4317`)
- `'console'`: Log traces to console (useful for debugging)
- `'none'`: Disable trace export

### Metrics Exporters

- `'otlp'`: OTLP over HTTP Protobuf (default endpoint: `http://localhost:4318`)
- `'otlp-grpc'`: OTLP over gRPC (default endpoint: `http://localhost:4317`)
- `'console'`: Log metrics to console (useful for debugging)
- `'none'`: Disable metrics export

## Examples

### Basic Setup with OTLP gRPC

```typescript
import { setupOpenTelemetry } from '@repo/open-telemetry';

setupOpenTelemetry({
  serviceInfo: {
    name: 'my-api',
    version: '1.0.0'
  },
  traces: {
    exporter: 'otlp-grpc'
  },
  metrics: {
    exporter: 'otlp-grpc'
  }
});
```

### Console Exporters (for Development)

```typescript
setupOpenTelemetry({
  serviceInfo: {
    name: 'my-api',
    version: '1.0.0'
  },
  traces: {
    exporter: 'console'
  },
  metrics: {
    exporter: 'console'
  }
});
```

### Custom Endpoints

```typescript
setupOpenTelemetry({
  serviceInfo: {
    name: 'my-api',
    version: '1.0.0'
  },
  traces: {
    exporter: 'otlp-http',
    endpoint: 'https://my-otel-collector.example.com:4318'
  },
  metrics: {
    exporter: 'otlp-http',
    endpoint: 'https://my-otel-collector.example.com:4318',
    intervalMillis: 10000
  }
});
```

### With Additional Instrumentations

```typescript
import { setupOpenTelemetry } from '@repo/open-telemetry';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

setupOpenTelemetry({
  serviceInfo: {
    name: 'my-api',
    version: '1.0.0'
  },
  traces: {
    exporter: 'otlp-grpc'
  },
  metrics: {
    exporter: 'otlp-grpc'
  },
  instrumentations: [
    // Add custom instrumentations here
  ]
});
```

## Viewing Telemetry Locally

To view traces and metrics locally, we recommend using the [Aspire dashboard in standalone mode](https://aspire.dev/dashboard/standalone-for-nodejs/). The Aspire dashboard provides an excellent user experience for viewing telemetry data.

### Quick Start with Aspire Dashboard

1. Start the Aspire dashboard:

```bash
docker run --rm -it -p 18888:18888 -p 4317:18889 --name aspire-dashboard \
  mcr.microsoft.com/dotnet/aspire-dashboard:latest
```

2. Configure your application to use OTLP gRPC:

```typescript
setupOpenTelemetry({
  serviceInfo: {
    name: 'my-api',
    version: '1.0.0'
  },
  traces: {
    exporter: 'otlp-grpc',
  },
  metrics: {
    exporter: 'otlp-grpc',
  }
});
```

3. Navigate to `http://localhost:18888` in your browser and enter the key shown in the Docker logs.

4. Make requests to your application and view the telemetry in the dashboard!

For more details, see the [Aspire dashboard documentation](https://aspire.dev/dashboard/standalone-for-nodejs/).

## Automatic Instrumentations

This package automatically instruments the following Node.js libraries:

- HTTP/HTTPS requests
- Express.js
- Fastify (via `@fastify/otel` when used with `@repo/fastify-observability`)
- MongoDB
- PostgreSQL
- Redis
- And many more via `@opentelemetry/auto-instrumentations-node`

Some instrumentations are disabled by default to reduce noise:
- `@opentelemetry/instrumentation-fastify` (deprecated, use `@fastify/otel` instead)
- `@opentelemetry/instrumentation-runtime-node` (too noisy)

## Graceful Shutdown

The package automatically handles graceful shutdown on `SIGTERM`, ensuring all telemetry is flushed before the process exits. This is important for production deployments where you want to capture all telemetry data.

## API Reference

### `setupOpenTelemetry(params: OpenTelemetryParams): void`

Initializes and starts the OpenTelemetry SDK with the provided configuration.

### `OpenTelemetryParams`

```typescript
type OpenTelemetryParams = {
  metrics: {
    exporter: MetricsExporter;
    intervalMillis?: number;
    endpoint?: string;
  };
  traces: {
    exporter: TraceExporter;
    endpoint?: string;
  };
  instrumentations?: NodeSDKConfiguration['instrumentations'];
  serviceInfo: {
    name: string;
    version: string;
  };
  logLevel?: string;
};
```

### `TraceExporter`

```typescript
type TraceExporter = 'otlp-http' | 'otlp-grpc' | 'console' | 'none';
```

### `MetricsExporter`

```typescript
type MetricsExporter = 'otlp' | 'otlp-grpc' | 'console' | 'none';
```

## License

See the root LICENSE file for details.
