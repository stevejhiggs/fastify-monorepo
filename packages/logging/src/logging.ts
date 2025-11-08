import logger from 'pino';

export function initLogger() {
  return logger({
    level: process.env['LOG_LEVEL'] || 'info'
  });
}
