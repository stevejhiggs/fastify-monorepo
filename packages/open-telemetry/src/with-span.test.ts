import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';

import { withSpan } from './with-span.ts';

const exporter = new InMemorySpanExporter();

let provider: NodeTracerProvider;

beforeAll(() => {
  provider = new NodeTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)]
  });
  provider.register();
});

afterAll(async () => {
  await provider.shutdown();
});

beforeEach(() => {
  exporter.reset();
});

describe('withSpan', () => {
  it('creates a span and returns the result on success', async () => {
    const result = await withSpan('test-op', async () => {
      return 42;
    });

    expect(result).toBe(42);

    const spans = exporter.getFinishedSpans();
    expect(spans).toHaveLength(1);
    expect(spans[0]?.name).toBe('test-op');
    expect(spans[0]?.status.code).toBe(SpanStatusCode.OK);
  });

  it('records exception and sets error status on failure', async () => {
    await expect(
      withSpan('failing-op', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    const spans = exporter.getFinishedSpans();
    expect(spans).toHaveLength(1);
    expect(spans[0]?.status.code).toBe(SpanStatusCode.ERROR);
    expect(spans[0]?.status.message).toBe('boom');
    expect(spans[0]?.events).toHaveLength(1);
    expect(spans[0]?.events[0]?.name).toBe('exception');
  });

  it('ends the span in both success and error paths', async () => {
    await withSpan('success-span', async () => 'ok');
    await expect(
      withSpan('error-span', async () => {
        throw new Error('fail');
      })
    ).rejects.toThrow();

    const spans = exporter.getFinishedSpans();
    expect(spans).toHaveLength(2);
    for (const span of spans) {
      expect(span.endTime).toBeDefined();
      expect(span.endTime[0]).toBeGreaterThan(0);
    }
  });

  it('supports span options like attributes and kind', async () => {
    await withSpan(
      'custom-op',
      async (span) => {
        span.setAttribute('custom.attr', 'value');
        return 'done';
      },
      { kind: SpanKind.CLIENT, attributes: { 'init.attr': 'hello' } }
    );

    const spans = exporter.getFinishedSpans();
    expect(spans).toHaveLength(1);
    expect(spans[0]?.kind).toBe(SpanKind.CLIENT);
    expect(spans[0]?.attributes['init.attr']).toBe('hello');
    expect(spans[0]?.attributes['custom.attr']).toBe('value');
  });

  it('supports custom tracer name', async () => {
    await withSpan('named-tracer-op', async () => 'ok', {
      tracerName: 'my-library'
    });

    const spans = exporter.getFinishedSpans();
    expect(spans).toHaveLength(1);
    expect(spans[0]?.instrumentationScope.name).toBe('my-library');
  });

  it('sets the span as active context during execution', async () => {
    let activeSpanName: string | undefined;

    await withSpan('parent', async () => {
      activeSpanName = trace.getActiveSpan()?.spanContext().spanId;
    });

    const spans = exporter.getFinishedSpans();
    expect(activeSpanName).toBe(spans[0]?.spanContext().spanId);
  });

  it('returns a plain value (not a Promise) for synchronous functions', () => {
    const result = withSpan('sync-op', () => 'sync-result');

    expect(result).toBe('sync-result');
    expect(result).not.toBeInstanceOf(Promise);

    const spans = exporter.getFinishedSpans();
    expect(spans).toHaveLength(1);
    expect(spans[0]?.status.code).toBe(SpanStatusCode.OK);
  });

  it('records exception and sets error status for sync throw', () => {
    expect(() =>
      withSpan('sync-fail', () => {
        throw new Error('sync boom');
      })
    ).toThrow('sync boom');

    const spans = exporter.getFinishedSpans();
    expect(spans).toHaveLength(1);
    expect(spans[0]?.status.code).toBe(SpanStatusCode.ERROR);
    expect(spans[0]?.status.message).toBe('sync boom');
    expect(spans[0]?.events[0]?.name).toBe('exception');
  });
});
