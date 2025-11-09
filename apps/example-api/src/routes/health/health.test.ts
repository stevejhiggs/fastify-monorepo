import type { ZodFastifyInstance } from '@repo/fastify-base';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import getServer from '@/server';

describe('endpoints -> health', () => {
  let app: ZodFastifyInstance;

  beforeEach(async () => {
    // allows us to spin up the server in memory
    app = await getServer();
  });

  afterEach(() => {
    app.close(() => {});
  });

  describe('/health', () => {
    it('should return a 200 for a GET request', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(result.statusCode).toBe(200);
    });

    it('should return a 404 with a POST request', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/health'
      });

      expect(result.statusCode).toBe(404);
    });
  });
});
