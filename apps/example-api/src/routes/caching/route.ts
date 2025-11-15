import { randomUUID } from 'node:crypto';
import type { EnhancedFastifyInstance } from '@repo/fastify-base';
import { createInMemoryCache } from '@repo/fastify-base/caching';
import z from 'zod';

const cache = createInMemoryCache({
  ttl: '20s',
  maxSize: 10
});

const cachedItemSchema = z.object({
  uuid: z.string(),
  timestamp: z.date()
});

const requestSchema = z.object({
  response: {
    200: cachedItemSchema
  }
});

type CachedItem = z.infer<typeof cachedItemSchema>;

export default function registerRoutes(app: EnhancedFastifyInstance) {
  app.get('/caching', { schema: requestSchema }, async (req, reply) => {
    // try to get the uuid from the cache
    const cachedItem = await cache.getItem<CachedItem>('test-item');
    if (cachedItem) {
      req.log.info({ message: 'cached hit', item: cachedItem });

      return reply.send(cachedItem);
    }

    // not found, so generate a new uuid
    const uuid = randomUUID();
    const timestamp = new Date();
    req.log.info({ message: 'cache miss', uuid });
    cache.setItem<CachedItem>('test-item', {
      uuid,
      timestamp: new Date()
    });

    reply.send({
      uuid,
      timestamp
    });
  });
}
