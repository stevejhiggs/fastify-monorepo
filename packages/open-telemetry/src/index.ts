import { DiagConsoleLogger, diag } from '@opentelemetry/api';
import {
  getNodeAutoInstrumentations,
  getResourceDetectors as getResourceDetectorsFromEnv
} from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter as OTLPMetricExporterGrpc } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPMetricExporterProto } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter as OTLPTraceExporterGrpc } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter as OTLPTraceExporterHttp } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  AggregationType,
  ConsoleMetricExporter,
  InstrumentType,
  PeriodicExportingMetricReader,
  type PushMetricExporter
} from '@opentelemetry/sdk-metrics';
import * as opentelemetry from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import type { ObjectValues } from '@repo/typescript-utils/types';

const metricsExporter = {
  Otlp: 'otlp',
  OtlpGrpc: 'otlp-grpc',
  Console: 'console',
  None: 'none'
} as const;

export type MetricsExporter = ObjectValues<typeof metricsExporter>;

const traceExporter = {
  OtlpHttp: 'otlp-http',
  OtlpGrpc: 'otlp-grpc',
  Console: 'console',
  None: 'none'
} as const;

export type TraceExporter = ObjectValues<typeof traceExporter>;

function getMetricReader(params: { metricsExporter: MetricsExporter; metricIntervalMillis?: number; endpoint?: string }) {
  const exportIntervalMillis = params.metricIntervalMillis ?? 5_000;
  const readerOptions = {
    exportIntervalMillis
  };

  let exporter: PushMetricExporter | undefined;

  switch (params.metricsExporter) {
    case 'otlp':
      diag.info('using otel protobuf metrics exporter');
      exporter = new OTLPMetricExporterProto({
        url: params.endpoint ?? 'http://localhost:4318',
        aggregationPreference: (instrumentType: InstrumentType) => {
          if (instrumentType === InstrumentType.HISTOGRAM) {
            return { type: AggregationType.EXPONENTIAL_HISTOGRAM };
          }
          return { type: AggregationType.DEFAULT };
        }
      });
      break;
    case 'otlp-grpc':
      diag.info('using otel grpcmetrics exporter');
      exporter = new OTLPMetricExporterGrpc({
        url: params.endpoint ?? 'http://localhost:4317'
      });
      break;
    case 'console':
      exporter = new ConsoleMetricExporter();
      break;
    case 'none':
      diag.info('disabling metrics reader');
      break;
    default:
      throw Error(`no valid option for OTEL_METRICS_EXPORTER`);
  }

  if (!exporter) {
    return undefined;
  }

  return new PeriodicExportingMetricReader({
    ...readerOptions,
    exporter
  });
}

function getTraceExporter(params: { traceExporter: TraceExporter; endpoint?: string }) {
  switch (params.traceExporter) {
    case 'otlp-http':
      return new OTLPTraceExporterHttp({ url: params.endpoint ?? 'http://localhost:4318' });
    case 'otlp-grpc':
      return new OTLPTraceExporterGrpc({ url: params.endpoint ?? 'http://localhost:4317' });
    case 'console':
      return new ConsoleSpanExporter();
    case 'none':
      return undefined;
    default:
      throw Error(`no valid option for OTEL_TRACE_EXPORTER`);
  }
}

export type OpenTelemetryParams = {
  metrics: {
    exporter: MetricsExporter;
    intervalMillis?: number;
    endpoint?: string;
  };
  traces: {
    exporter: TraceExporter;
    endpoint?: string;
  };
  instrumentations?: opentelemetry.NodeSDKConfiguration['instrumentations'];
  serviceInfo: {
    name: string;
    version: string;
  };
  logLevel?: string;
};

export function setupOpenTelemetry(params: OpenTelemetryParams) {
  diag.setLogger(new DiagConsoleLogger(), opentelemetry.core.diagLogLevelFromString(params.logLevel ?? 'info'));

  const sdk = new opentelemetry.NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: params.serviceInfo.name,
      [ATTR_SERVICE_VERSION]: params.serviceInfo.version
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable deprecated instrumentations
        '@opentelemetry/instrumentation-fastify': { enabled: false }
        // Disable noisy instrumentations
        //'@opentelemetry/instrumentation-runtime-node': { enabled: true }
      }),
      ...(params.instrumentations ?? [])
    ],
    resourceDetectors: getResourceDetectorsFromEnv(),
    traceExporter: getTraceExporter({ traceExporter: params.traces.exporter, endpoint: params.traces.endpoint }),
    metricReader: getMetricReader({
      metricsExporter: params.metrics.exporter,
      metricIntervalMillis: params.metrics.intervalMillis,
      endpoint: params.metrics.endpoint
    })
  });

  try {
    sdk.start();
    diag.info('OpenTelemetry automatic instrumentation started successfully');
  } catch (error) {
    diag.error('Error initializing OpenTelemetry SDK. Your application is not instrumented and will not produce telemetry', error);
  }

  // Gracefully shut down the SDK to flush telemetry when the program exits
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => diag.debug('OpenTelemetry SDK terminated'))
      .catch((error) => diag.error('Error terminating OpenTelemetry SDK', error));
  });
}
