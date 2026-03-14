import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import type { AuthProvider } from './index.ts';
import { registerAuth } from './index.ts';

function createMockProvider(userId: string, headerName: string): AuthProvider {
  return {
    async verify(request) {
      const header = request.headers[headerName];
      if (header === 'valid') return { sub: userId };
      if (header !== undefined) throw new Error(`invalid ${headerName}`);
      return undefined;
    }
  };
}

async function buildApp(providers: AuthProvider[]) {
  const app = fastify({ logger: false });
  await registerAuth(app, providers);

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

describe('registerAuth', () => {
  describe('authenticate (required auth)', () => {
    it('returns 200 and user payload for valid token', async () => {
      const app = await buildApp([createMockProvider('user-123', 'x-mock-token')]);
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { 'x-mock-token': 'valid' }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ sub: 'user-123' });
    });

    it('returns 401 when no token provided', async () => {
      const app = await buildApp([createMockProvider('user-123', 'x-mock-token')]);
      const response = await app.inject({ method: 'GET', url: '/protected' });
      expect(response.statusCode).toBe(401);
    });

    it('returns 401 for an invalid token', async () => {
      const app = await buildApp([createMockProvider('user-123', 'x-mock-token')]);
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { 'x-mock-token': 'bad' }
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe('populateUser (optional auth)', () => {
    it('sets request.user for valid token', async () => {
      const app = await buildApp([createMockProvider('user-123', 'x-mock-token')]);
      const response = await app.inject({
        method: 'GET',
        url: '/optional',
        headers: { 'x-mock-token': 'valid' }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ user: { sub: 'user-123' } });
    });

    it('continues without error when no token is provided', async () => {
      const app = await buildApp([createMockProvider('user-123', 'x-mock-token')]);
      const response = await app.inject({ method: 'GET', url: '/optional' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ user: null });
    });

    it('returns 401 when token is present but invalid', async () => {
      const app = await buildApp([createMockProvider('user-123', 'x-mock-token')]);
      const response = await app.inject({
        method: 'GET',
        url: '/optional',
        headers: { 'x-mock-token': 'bad' }
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe('requireUser', () => {
    it('returns 401 when user is not set', async () => {
      const app = await buildApp([createMockProvider('user-123', 'x-mock-token')]);
      const response = await app.inject({ method: 'GET', url: '/composed' });
      expect(response.statusCode).toBe(401);
    });

    it('allows access when user is populated', async () => {
      const app = await buildApp([createMockProvider('user-789', 'x-mock-token')]);
      const response = await app.inject({
        method: 'GET',
        url: '/composed',
        headers: { 'x-mock-token': 'valid' }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ sub: 'user-789' });
    });
  });
});

describe('registerAuth with multiple providers', () => {
  it('authenticates via first provider', async () => {
    const app = await buildApp([createMockProvider('user-p1', 'x-mock-token'), createMockProvider('user-p2', 'x-alt-token')]);
    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { 'x-mock-token': 'valid' }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ sub: 'user-p1' });
  });

  it('authenticates via second provider when first returns undefined', async () => {
    const app = await buildApp([createMockProvider('user-p1', 'x-mock-token'), createMockProvider('user-p2', 'x-alt-token')]);
    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { 'x-alt-token': 'valid' }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ sub: 'user-p2' });
  });

  it('returns 401 when no token is provided', async () => {
    const app = await buildApp([createMockProvider('user-p1', 'x-mock-token'), createMockProvider('user-p2', 'x-alt-token')]);
    const response = await app.inject({ method: 'GET', url: '/protected' });
    expect(response.statusCode).toBe(401);
  });

  it('returns 401 when token is invalid for all providers', async () => {
    const app = await buildApp([createMockProvider('user-p1', 'x-mock-token'), createMockProvider('user-p2', 'x-alt-token')]);
    const response = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: { 'x-mock-token': 'bad', 'x-alt-token': 'bad' }
    });
    expect(response.statusCode).toBe(401);
  });

  it('continues without error when no token and using populateUser', async () => {
    const app = await buildApp([createMockProvider('user-p1', 'x-mock-token'), createMockProvider('user-p2', 'x-alt-token')]);
    const response = await app.inject({ method: 'GET', url: '/optional' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ user: null });
  });

  it('calls setup on providers that have it', async () => {
    let setupCalled = false;
    const providerWithSetup: AuthProvider = {
      async setup() {
        setupCalled = true;
      },
      async verify() {
        return undefined;
      }
    };
    await buildApp([providerWithSetup]);
    expect(setupCalled).toBe(true);
  });
});
