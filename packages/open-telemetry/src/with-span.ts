import { SpanStatusCode, trace, type Span, type SpanOptions } from '@opentelemetry/api';

const DEFAULT_TRACER_NAME = 'app';

type WithSpanOptions = SpanOptions & { tracerName?: string };

function handleError(span: Span, err: unknown): never {
  if (err instanceof Error) {
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  } else {
    span.setStatus({ code: SpanStatusCode.ERROR });
  }
  span.end();
  throw err;
}

/**
 * Wraps an async or sync function in an OpenTelemetry span with automatic
 * error recording, status setting, and span lifecycle management.
 *
 * Preserves the sync/async nature of the wrapped function — if `fn` returns
 * a plain value, `withSpan` returns a plain value (no Promise wrapping).
 *
 * @example Async
 * ```typescript
 * const user = await withSpan('getUser', async (span) => {
 *   span.setAttribute('userId', id);
 *   return db.users.findById(id);
 * });
 * ```
 *
 * @example Sync
 * ```typescript
 * const value = withSpan('compute', (span) => {
 *   span.setAttribute('input', x);
 *   return expensiveComputation(x);
 * });
 * ```
 *
 * @example With options
 * ```typescript
 * await withSpan('sendEmail', sendFn, {
 *   attributes: { 'email.to': addr },
 *   kind: SpanKind.CLIENT,
 * });
 * ```
 */
export function withSpan<T>(name: string, fn: (span: Span) => T, options?: WithSpanOptions): T {
  const { tracerName = DEFAULT_TRACER_NAME, ...spanOptions } = options ?? {};
  const tracer = trace.getTracer(tracerName);

  return tracer.startActiveSpan(name, spanOptions, (span) => {
    try {
      const result = fn(span);

      if (result instanceof Promise) {
        return result.then(
          (value) => {
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();
            return value;
          },
          (err: unknown) => handleError(span, err)
        ) as T; // eslint-disable-line no-unsafe-type-assertion -- Safe: we verified result is a Promise, so T is Promise<...>
      }

      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return result;
    } catch (err: unknown) {
      return handleError(span, err);
    }
  });
}
