import jwt from '@fastify/jwt';
import { extractBearerToken, type AuthProvider, type JwtPayload } from '@repo/fastify-auth';
import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload | undefined;
  }
}

export type JwtConfig = {
  audience?: string[];
} & ({ secret: string } | { publicKey: string; privateKey: string });

export function jwtProvider(config: JwtConfig): AuthProvider {
  return {
    async setup(app: FastifyInstanceForRegistration) {
      await app.register(jwt, {
        secret: 'secret' in config ? config.secret : { public: config.publicKey, private: config.privateKey },
        ...(config.audience ? { verify: { allowedAud: config.audience, requiredClaims: ['aud'] } } : {})
      });
    },

    async verify(request) {
      const token = extractBearerToken(request);
      if (!token) return undefined;
      // Use server.jwt.verify() instead of request.jwtVerify() so that
      // @fastify/jwt does not set request.user — the core handles that.
      // Throws on invalid/expired token, propagating a 401 to the caller.
      return request.server.jwt.verify<JwtPayload>(token);
    }
  };
}
