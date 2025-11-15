import { randomUUID } from 'node:crypto';
import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import { createInMemoryCache } from '@repo/fastify-base/caching';

const cache = createInMemoryCache({
  ttl: '5s',
  maxSize: 10
});

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.get('/caching', async (req, reply) => {
    // try to get the uuid from the cache
    const cachedUuid = await cache.getItem<string>('test-uuid');
    if (cachedUuid) {
      req.log.info({ message: 'cached hit', uuid: cachedUuid });

      return reply.send({ uuid: cachedUuid });
    }

    // not found, so generate a new uuid
    const uuid = randomUUID();
    req.log.info({ message: 'cache miss', uuid });
    cache.setItem('test-uuid', uuid);

    reply.send({ uuid });
  });
}
