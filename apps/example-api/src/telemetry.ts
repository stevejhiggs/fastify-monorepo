import { setupFastifyOpenTelemetry } from '@repo/fastify-base/telemetry/setup';
import { name, version } from '../package.json';

setupFastifyOpenTelemetry({
  serviceInfo: {
    name,
    version
  },
  traces: {
    exporter: 'otlp-grpc'
  },
  metrics: {
    exporter: 'otlp-grpc',
    intervalMillis: 1000
  },
  logLevel: 'info'
});
