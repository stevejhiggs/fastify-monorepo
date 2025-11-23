import { setupFastifyOpenTelemetry } from '@repo/fastify-base/telemetry/setup';

setupFastifyOpenTelemetry({
  metricsExporter: 'console',
  metricIntervalMillis: 1000,
  logLevel: 'info'
});
