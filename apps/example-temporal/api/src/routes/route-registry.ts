import type { EnhancedFastifyInstance } from '@repo/fastify-base';

import health from './health/route';

// This is a central place to hook in all your routes
export default function registerRoutes(app: EnhancedFastifyInstance) {
  health(app);
}
