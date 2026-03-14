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
  function log(level: LogLevel, message: string, meta?: LogMetadata) {
    const pinoLevel = pinoLevelMap[level];
    if (!pinoLevel) return;
    logger[pinoLevel](meta ?? {}, message);
  }

  return {
    log,
    trace: (message, meta?) => log('TRACE' as LogLevel, message, meta),
    debug: (message, meta?) => log('DEBUG' as LogLevel, message, meta),
    info: (message, meta?) => log('INFO' as LogLevel, message, meta),
    warn: (message, meta?) => log('WARN' as LogLevel, message, meta),
    error: (message, meta?) => log('ERROR' as LogLevel, message, meta)
  };
}
