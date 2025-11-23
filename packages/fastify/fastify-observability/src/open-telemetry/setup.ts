import FastifyOtelInstrumentation from '@fastify/otel';
import { type OpenTelemetryParams, setupOpenTelemetry } from '@repo/open-telemetry';

export type FastifyOpenTelemetryParams = OpenTelemetryParams;

export const fastifyOtelInstrumentation = new FastifyOtelInstrumentation({ registerOnInitialization: true });

export function setupFastifyOpenTelemetry(params: FastifyOpenTelemetryParams) {
  setupOpenTelemetry({ ...params, instrumentations: [fastifyOtelInstrumentation] });
}
