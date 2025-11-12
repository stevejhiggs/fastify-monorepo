import { createGcpLoggingPinoConfig } from '@google-cloud/pino-logging-gcp-config';
import logger, { type LevelWithSilentOrString, type LoggerOptions } from 'pino';

export type { Logger } from 'pino';

const outputFormat = {
  default: 'DEFAULT',
  gcp: 'GCP'
};
export type OutputFormat = (typeof outputFormat)[keyof typeof outputFormat];

export type LoggerConfig = {
  outputFormat?: OutputFormat;
  logLevel?: LevelWithSilentOrString | undefined;
};

function getPlatformOptions(outputFormat?: OutputFormat): LoggerOptions<never, boolean> | undefined {
  if (outputFormat === 'GCP') {
    return createGcpLoggingPinoConfig();
  }
  return undefined;
}

export function initLogger(config?: LoggerConfig) {
  const platformOptions = getPlatformOptions(config?.outputFormat);

  // Use default config with optional logLevel
  return logger.pino({
    ...platformOptions,
    level: config?.logLevel ?? 'info'
  });
}
