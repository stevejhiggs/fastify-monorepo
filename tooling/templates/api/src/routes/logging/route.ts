/**
 * Request-scoped logging with trace correlation and custom spans.
 * Shows how the logger automatically includes traceId/spanId when OTel is
 * enabled, and how withSpan creates child spans with automatic error handling.
 */
import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import { logger } from '@repo/fastify-base/logging';
import { withSpan } from '@repo/open-telemetry';

async function fetchUserData(userId: string) {
  return withSpan('fetchUserData', async (span) => {
    span.setAttribute('userId', userId);
    logger.instance.info({ userId }, 'fetching user data');
    return { id: userId, name: 'Example User' };
  });
}

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.get('/logging', async (_req, reply) => {
    const user = await fetchUserData('user-123');
    logger.instance.info({ user }, 'request complete — traceId and spanId are included automatically');
    reply.send('OK');
  });
}
