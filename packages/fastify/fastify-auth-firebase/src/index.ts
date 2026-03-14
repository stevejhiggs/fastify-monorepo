import { extractBearerToken, type AuthProvider, type JwtPayload } from '@repo/fastify-auth';
import { getApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export type FirebaseConfig = {
  tenantId: string;
  app?: App;
};

export function firebaseProvider(config: FirebaseConfig): AuthProvider {
  const tenantAuth = getAuth(config.app ?? getApp())
    .tenantManager()
    .authForTenant(config.tenantId);

  return {
    async verify(request) {
      const token = extractBearerToken(request);
      if (!token) return undefined;
      // checkRevoked: true rejects tokens whose session has been revoked
      const { uid, ...rest } = await tenantAuth.verifyIdToken(token, true);
      return { ...rest, sub: uid } as JwtPayload;
    }
  };
}
