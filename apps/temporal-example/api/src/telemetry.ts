import { setupFastifyOpenTelemetry } from '@repo/fastify-base/telemetry/setup';

import { name, version } from '../package.json';

setupFastifyOpenTelemetry({
  serviceInfo: {
    name,
    version
  },
  traces: {
    // change me - see open-telemetry package readme
    exporter: 'console'
  },
  metrics: {
    // change me
    exporter: 'console'
  },
  logLevel: 'info'
});
