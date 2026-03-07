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

async function requireUser(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
}

export async function registerAuth(app: FastifyInstanceForRegistration, provider: AuthProvider) {
  await provider.setup?.(app);

  const populateUser = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await provider.verify(request);
      if (user !== undefined) {
        request.user = user;
      }
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' });
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
