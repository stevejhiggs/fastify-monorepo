import type { Logger } from '@repo/logging';
import type { LogLevel, LogMetadata, Logger as TemporalLogger } from '@temporalio/worker';

const pinoLevelMap: Record<string, 'trace' | 'debug' | 'info' | 'warn' | 'error'> = {
  TRACE: 'trace',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

/** Adapts a pino logger from @repo/logging to Temporal's Logger interface */
export function createTemporalLogger(logger: Logger): TemporalLogger {
  return {
    log(level: LogLevel, message: string, meta?: LogMetadata) {
      const pinoLevel = pinoLevelMap[level] ?? 'info';
      logger[pinoLevel](meta ?? {}, message);
    },
    trace: (message: string, meta?: LogMetadata) => logger.trace(meta ?? {}, message),
    debug: (message: string, meta?: LogMetadata) => logger.debug(meta ?? {}, message),
    info: (message: string, meta?: LogMetadata) => logger.info(meta ?? {}, message),
    warn: (message: string, meta?: LogMetadata) => logger.warn(meta ?? {}, message),
    error: (message: string, meta?: LogMetadata) => logger.error(meta ?? {}, message)
  };
}
