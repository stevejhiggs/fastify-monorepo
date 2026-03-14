/**
 * Custom OpenTelemetry metrics example.
 * Demonstrates creating and recording custom counter and histogram metrics
 * using the OpenTelemetry API. Run with `pnpm dev:with-telemetry` to see
 * metrics exported to the console.
 */
import { metrics } from '@opentelemetry/api';
import type { EnhancedFastifyInstance } from '@repo/fastify-base';

const meter = metrics.getMeter('example-api');

type RequestCounterAttributes = {
  'request.method': string;
  'request.route': string;
  'request.status': 'success' | 'error';
};

type ProcessingDurationAttributes = {
  'request.route': string;
  'processing.type': 'simulated' | 'real';
};

const requestCounter = meter.createCounter<RequestCounterAttributes>('example.requests', {
  description: 'Total number of example metric requests',
  unit: '{request}'
});

const processingDuration = meter.createHistogram<ProcessingDurationAttributes>('example.processing_duration', {
  description: 'Time spent processing the example request',
  unit: 'ms'
});

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.get('/metrics-example', async (req, reply) => {
    const start = performance.now();

    // Simulate some work
    const delay = Math.floor(Math.random() * 100) + 10;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const duration = performance.now() - start;

    // Record a counter increment with typed attributes
    requestCounter.add(1, { 'request.method': 'GET', 'request.route': '/metrics-example', 'request.status': 'success' });

    // Record a histogram observation with typed attributes
    processingDuration.record(duration, { 'request.route': '/metrics-example', 'processing.type': 'simulated' });

    req.log.info({ duration }, 'recorded custom metrics');

    reply.send({ message: 'OK', processingTimeMs: Math.round(duration) });
  });
}
