import { DiagConsoleLogger, diag } from '@opentelemetry/api';
import {
  getNodeAutoInstrumentations,
  getResourceDetectors as getResourceDetectorsFromEnv
} from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { AggregationType, ConsoleMetricExporter, InstrumentType, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import * as opentelemetry from '@opentelemetry/sdk-node';
import type { ObjectValues } from '@repo/typescript-utils/types';

const metricsExporter = {
  Otlp: 'otlp',
  Console: 'console',
  None: 'none'
} as const;

export type MetricsExporter = ObjectValues<typeof metricsExporter>;

function getMetricReader(params: { metricsExporter: MetricsExporter; metricIntervalMillis?: number }) {
  const exportIntervalMillis = params.metricIntervalMillis ?? 5_000;
  const readerOptions = {
    exportIntervalMillis
  };

  switch (params.metricsExporter) {
    case 'otlp':
      diag.info('using otel metrics exporter');
      return new PeriodicExportingMetricReader({
        ...readerOptions,
        exporter: new OTLPMetricExporter({
          aggregationPreference: (instrumentType: InstrumentType) => {
            if (instrumentType === InstrumentType.HISTOGRAM) {
              return { type: AggregationType.EXPONENTIAL_HISTOGRAM };
            }
            return { type: AggregationType.DEFAULT };
          }
        })
      });
    case 'console':
      return new PeriodicExportingMetricReader({
        ...readerOptions,
        exporter: new ConsoleMetricExporter()
      });
    case 'none':
      diag.info('disabling metrics reader');
      return undefined;
    default:
      throw Error(`no valid option for OTEL_METRICS_EXPORTER`);
  }
}

export function setupOpenTelemetry(params: {
  metricsExporter: MetricsExporter;
  instrumentations?: opentelemetry.NodeSDKConfiguration['instrumentations'];
  metricIntervalMillis?: number;
  logLevel?: string;
}) {
  diag.setLogger(new DiagConsoleLogger(), opentelemetry.core.diagLogLevelFromString(params.logLevel ?? 'info'));

  const sdk = new opentelemetry.NodeSDK({
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable deprecated instrumentations
        '@opentelemetry/instrumentation-fastify': { enabled: false },
        // Disable noisy instrumentations
        '@opentelemetry/instrumentation-runtime-node': { enabled: false }
      }),
      ...(params.instrumentations ?? [])
    ],
    resourceDetectors: getResourceDetectorsFromEnv(),
    metricReader: getMetricReader({
      metricsExporter: params.metricsExporter,
      metricIntervalMillis: params.metricIntervalMillis
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
