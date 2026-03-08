import { jwtProvider } from '@repo/fastify-auth-jwt';
import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import { registerAuth } from './index.ts';

const SECRET = 'test-secret-at-least-32-chars-long!!';

async function buildApp(config: Parameters<typeof jwtProvider>[0]) {
  const app = fastify({ logger: false });
  await registerAuth(app, [jwtProvider(config)]);

  app.get('/protected', { preHandler: [app.authenticate] }, async (request) => {
    return request.user;
  });

  app.get('/optional', { preHandler: [app.populateUser] }, async (request) => {
    return { user: request.user ?? null };
  });

  app.get('/composed', { preHandler: [app.populateUser, app.requireUser] }, async (request) => {
    return request.user;
  });

  await app.ready();
  return app;
}

describe('registerAuth with jwtProvider', () => {
  describe('authenticate (required auth)', () => {
    it('returns 200 and user payload for valid token', async () => {
      const app = await buildApp({ secret: SECRET });
      const token = app.jwt.sign({ sub: 'user-123', role: 'admin' });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ sub: 'user-123', role: 'admin' });
    });

    it('returns 401 when no token provided', async () => {
      const app = await buildApp({ secret: SECRET });
      const response = await app.inject({ method: 'GET', url: '/protected' });
      expect(response.statusCode).toBe(401);
    });

    it('returns 401 for an invalid token', async () => {
      const app = await buildApp({ secret: SECRET });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { authorization: 'Bearer not-a-valid-token' }
      });
      expect(response.statusCode).toBe(401);
    });

    it('returns 401 for an expired token', async () => {
      const app = await buildApp({ secret: SECRET });
      const token = app.jwt.sign({ sub: 'user-123', iat: Math.floor(Date.now() / 1000) - 3600 }, { expiresIn: '1s' });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe('populateUser (optional auth)', () => {
    it('sets request.user for valid token', async () => {
      const app = await buildApp({ secret: SECRET });
      const token = app.jwt.sign({ sub: 'user-123' });
      const response = await app.inject({
        method: 'GET',
        url: '/optional',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ user: { sub: 'user-123' } });
    });

    it('continues without error when no token is provided', async () => {
      const app = await buildApp({ secret: SECRET });
      const response = await app.inject({ method: 'GET', url: '/optional' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ user: null });
    });

    it('returns 401 when token is present but invalid', async () => {
      const app = await buildApp({ secret: SECRET });

      const response = await app.inject({
        method: 'GET',
        url: '/optional',
        headers: { authorization: 'Bearer not-a-valid-token' }
      });

      expect(response.statusCode).toBe(401);
    });

    it('returns 401 when token is present but expired', async () => {
      const app = await buildApp({ secret: SECRET });

      const token = app.jwt.sign({ sub: 'user-123', iat: Math.floor(Date.now() / 1000) - 3600 }, { expiresIn: '1s' });

      const response = await app.inject({
        method: 'GET',
        url: '/optional',
        headers: { authorization: `Bearer ${token}` }
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('requireUser', () => {
    it('returns 401 when user is not set', async () => {
      const app = await buildApp({ secret: SECRET });
      const response = await app.inject({ method: 'GET', url: '/composed' });
      expect(response.statusCode).toBe(401);
    });

    it('allows access when user is populated', async () => {
      const app = await buildApp({ secret: SECRET });
      const token = app.jwt.sign({ sub: 'user-789' });
      const response = await app.inject({
        method: 'GET',
        url: '/composed',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ sub: 'user-789' });
    });
  });
});

// A simple mock provider that authenticates requests with a static "X-Mock-Token" header
function mockProvider(userId: string): import('./index.ts').AuthProvider {
  return {
    async verify(request) {
      const header = request.headers['x-mock-token'];
      if (header === 'valid') return { sub: userId };
      if (header !== undefined) throw new Error('invalid mock token');
      return undefined;
    }
  };
}

describe('registerAuth with multiple providers', () => {
  async function buildMultiProviderApp() {
    const app = fastify({ logger: false });
    // jwt provider handles Bearer tokens; mockProvider handles X-Mock-Token header
    await registerAuth(app, [jwtProvider({ secret: SECRET }), mockProvider('mock-user')]);

    app.get('/protected', { preHandler: [app.authenticate] }, async (request) => {
      return request.user;
    });

    app.get('/optional', { preHandler: [app.populateUser] }, async (request) => {
      return { user: request.user ?? null };
    });

    await app.ready();
    return app;
  }

  it('authenticates via first provider (jwt)', async () => {
    const app = await buildMultiProviderApp();
    const token = app.jwt.sign({ sub: 'user-p1' });
    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { authorization: `Bearer ${token}` }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ sub: 'user-p1' });
  });

  it('authenticates via second provider (mock) when first returns undefined', async () => {
    const app = await buildMultiProviderApp();
    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { 'x-mock-token': 'valid' }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ sub: 'mock-user' });
  });

  it('returns 401 when no token is provided', async () => {
    const app = await buildMultiProviderApp();
    const response = await app.inject({ method: 'GET', url: '/protected' });
    expect(response.statusCode).toBe(401);
  });

  it('returns 401 when token is invalid for all providers', async () => {
    const app = await buildMultiProviderApp();
    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { authorization: 'Bearer not-a-valid-token', 'x-mock-token': 'bad' }
    });
    expect(response.statusCode).toBe(401);
  });

  it('continues without error when no token and using populateUser', async () => {
    const app = await buildMultiProviderApp();
    const response = await app.inject({ method: 'GET', url: '/optional' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ user: null });
  });
});
