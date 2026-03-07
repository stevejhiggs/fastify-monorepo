import { createGcpLoggingPinoConfig } from '@google-cloud/pino-logging-gcp-config';
import logger, { type LevelWithSilentOrString, type LoggerOptions } from 'pino';

export type { Logger } from 'pino';

const outputFormatEnum = {
  default: 'DEFAULT',
  gcp: 'GCP'
};
export type OutputFormatEnum = (typeof outputFormatEnum)[keyof typeof outputFormatEnum];

export type LoggerConfig = {
  outputFormat?: OutputFormatEnum;
  logLevel?: LevelWithSilentOrString | undefined;
};

function getPlatformOptions(outputFormat?: OutputFormatEnum): LoggerOptions | undefined {
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
