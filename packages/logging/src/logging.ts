import logger, { type LevelWithSilentOrString } from 'pino';

export type LoggerConfig = {
  logLevel?: LevelWithSilentOrString | undefined;
};

export function initLogger(config: LoggerConfig) {
  return logger({
    level: config.logLevel ?? 'info'
  });
}
