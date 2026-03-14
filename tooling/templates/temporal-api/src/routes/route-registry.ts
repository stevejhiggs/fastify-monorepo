import type { EnhancedFastifyInstance } from '@repo/fastify-base';

import greeting from './greeting/route.ts';
import health from './health/route.ts';

// This is a central place to hook in all your routes
export default function registerRoutes(app: EnhancedFastifyInstance) {
  health(app);
  greeting(app);
}
