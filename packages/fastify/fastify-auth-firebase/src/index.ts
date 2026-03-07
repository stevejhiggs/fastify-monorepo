import type { AuthProvider, JwtPayload } from '@repo/fastify-auth';
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
      const header = request.headers.authorization;
      if (!header?.startsWith('Bearer ')) return undefined;
      const token = header.slice(7);
      // checkRevoked: true rejects tokens whose session has been revoked
      const decoded = await tenantAuth.verifyIdToken(token, true);
      const { uid, ...rest } = decoded;
      const payload: JwtPayload = { sub: uid };
      for (const [k, v] of Object.entries(rest)) {
        payload[k] = v;
      }
      return payload;
    }
  };
}
