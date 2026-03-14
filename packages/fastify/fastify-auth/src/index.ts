import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';
import type { FastifyReply, FastifyRequest } from 'fastify';

export interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

export interface AuthProvider {
  setup?(app: FastifyInstanceForRegistration): Promise<void>;
  verify(request: FastifyRequest): Promise<JwtPayload | undefined>;
}

declare module 'fastify' {
  interface FastifyInstance {
    populateUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user: JwtPayload | undefined;
  }
}

const UNAUTHORIZED = { message: 'Unauthorized' } as const;

export function extractBearerToken(request: FastifyRequest): string | undefined {
  const auth = request.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return undefined;
  return auth.slice(7);
}

async function requireUser(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send(UNAUTHORIZED);
  }
}

export async function registerAuth(app: FastifyInstanceForRegistration, providers: AuthProvider[]) {
  for (const provider of providers) {
    await provider.setup?.(app);
  }

  const populateUser = async (request: FastifyRequest, reply: FastifyReply) => {
    let lastError: unknown;
    for (const provider of providers) {
      try {
        const user = await provider.verify(request);
        if (user !== undefined) {
          request.user = user;
          return;
        }
      } catch (err) {
        lastError = err;
      }
    }
    if (lastError !== undefined) {
      return reply.status(401).send(UNAUTHORIZED);
    }
  };

  app.decorate('populateUser', populateUser);
  app.decorate('requireUser', requireUser);
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    await populateUser(request, reply);
    if (!reply.sent) {
      await requireUser(request, reply);
    }
  });
}
