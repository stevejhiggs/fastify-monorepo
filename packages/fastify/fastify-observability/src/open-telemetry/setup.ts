import FastifyOtelInstrumentation from '@fastify/otel';
import { type MetricsExporter, setupOpenTelemetry } from '@repo/open-telemetry';

export type FastifyOpenTelemetryParams = {
  metricsExporter: MetricsExporter;
  metricIntervalMillis?: number;
  logLevel?: string;
};

export const fastifyOtelInstrumentation = new FastifyOtelInstrumentation();

export function setupFastifyOpenTelemetry(params: { metricsExporter: MetricsExporter; metricIntervalMillis?: number; logLevel?: string }) {
  setupOpenTelemetry({ ...params, instrumentations: [fastifyOtelInstrumentation] });
}
