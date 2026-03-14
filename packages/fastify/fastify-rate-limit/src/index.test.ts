import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import { registerRateLimit } from './index.ts';

async function buildApp(options?: Parameters<typeof registerRateLimit>[1]) {
  const app = fastify({ logger: false });
  await registerRateLimit(app, { max: 2, timeWindow: 1000, ...options });

  app.get('/test', async () => {
    return { ok: true };
  });

  await app.ready();
  return app;
}

describe('registerRateLimit', () => {
  it('allows requests under the limit', async () => {
    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/test' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });

  it('includes rate limit headers', async () => {
    const app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/test' });
    expect(response.headers['x-ratelimit-limit']).toBe('2');
    expect(response.headers['x-ratelimit-remaining']).toBe('1');
  });

  it('returns 429 when limit is exceeded', async () => {
    const app = await buildApp({ max: 1 });
    await app.inject({ method: 'GET', url: '/test' });
    const response = await app.inject({ method: 'GET', url: '/test' });
    expect(response.statusCode).toBe(429);
  });

  it('respects custom max option', async () => {
    const app = await buildApp({ max: 3 });
    for (let i = 0; i < 3; i++) {
      const response = await app.inject({ method: 'GET', url: '/test' });
      expect(response.statusCode).toBe(200);
    }
    const response = await app.inject({ method: 'GET', url: '/test' });
    expect(response.statusCode).toBe(429);
  });

  it('supports global: false to disable on all routes', async () => {
    const app = fastify({ logger: false });
    await registerRateLimit(app, { global: false, max: 1, timeWindow: 1000 });

    app.get('/unlimited', async () => {
      return { ok: true };
    });

    await app.ready();

    for (let i = 0; i < 5; i++) {
      const response = await app.inject({ method: 'GET', url: '/unlimited' });
      expect(response.statusCode).toBe(200);
    }
  });
});
