import { registerAuth } from '@repo/fastify-auth';
import fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import { jwtProvider } from './index.ts';

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

describe('jwtProvider', () => {
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
    it('sets request.user when a valid token is provided', async () => {
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
    it('returns 401 when user is not set (no token)', async () => {
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

  describe('audience validation', () => {
    it('accepts token with a matching audience', async () => {
      const app = await buildApp({ secret: SECRET, audience: ['api'] });
      const token = app.jwt.sign({ sub: 'user-123', aud: 'api' });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
    });

    it('accepts token when audience is in the allowed list', async () => {
      const app = await buildApp({ secret: SECRET, audience: ['api', 'admin'] });
      const token = app.jwt.sign({ sub: 'user-123', aud: 'admin' });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
    });

    it('returns 401 when token audience does not match', async () => {
      const app = await buildApp({ secret: SECRET, audience: ['api'] });
      const token = app.jwt.sign({ sub: 'user-123', aud: 'other' });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(401);
    });

    it('returns 401 when token has no audience but audience is required', async () => {
      const app = await buildApp({ secret: SECRET, audience: ['api'] });
      const token = app.jwt.sign({ sub: 'user-123' });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(401);
    });

    it('does not check audience when not configured', async () => {
      const app = await buildApp({ secret: SECRET });
      const token = app.jwt.sign({ sub: 'user-123', aud: 'anything' });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('asymmetric keypair (RS256)', () => {
    it('returns 200 for a valid RS256 token', async () => {
      const { generateKeyPairSync } = await import('node:crypto');
      const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });
      const app = await buildApp({ publicKey, privateKey });
      const token = app.jwt.sign({ sub: 'user-456' });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: { authorization: `Bearer ${token}` }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ sub: 'user-456' });
    });
  });
});
