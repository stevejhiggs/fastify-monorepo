import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('firebase-admin/app');
vi.mock('firebase-admin/auth');

import type { App } from 'firebase-admin/app';
import { getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

import { firebaseProvider } from './index.ts';

const TENANT_ID = 'test-tenant';

function makeRequest(authorization?: string) {
  return {
    headers: { authorization }
  } as { headers: { authorization?: string } };
}

describe('firebaseProvider', () => {
  const mockVerifyIdToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
    vi.mocked(getApp).mockReturnValue({} as App);
    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
    vi.mocked(getAuth).mockReturnValue({
      tenantManager: () => ({
        authForTenant: () => ({ verifyIdToken: mockVerifyIdToken })
      })
    } as unknown as ReturnType<typeof getAuth>);
  });

  function makeProvider(app?: App) {
    return firebaseProvider({ tenantId: TENANT_ID, app });
  }

  describe('verify', () => {
    it('returns undefined when no Authorization header is present', async () => {
      const provider = makeProvider();
      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
      const result = await provider.verify(makeRequest() as never);
      expect(result).toBeUndefined();
    });

    it('returns undefined when Authorization header does not start with Bearer', async () => {
      const provider = makeProvider();
      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
      const result = await provider.verify(makeRequest('Basic abc123') as never);
      expect(result).toBeUndefined();
      expect(mockVerifyIdToken).not.toHaveBeenCalled();
    });

    it('calls verifyIdToken with the token and checkRevoked=true', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'user-123', email: 'user@example.com' });
      const provider = makeProvider();

      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
      await provider.verify(makeRequest('Bearer my-token') as never);

      expect(mockVerifyIdToken).toHaveBeenCalledWith('my-token', true);
    });

    it('returns a JwtPayload with sub mapped from uid', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'user-123', email: 'user@example.com' });
      const provider = makeProvider();

      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
      const result = await provider.verify(makeRequest('Bearer my-token') as never);

      expect(result).toMatchObject({ sub: 'user-123', email: 'user@example.com' });
    });

    it('propagates errors thrown by verifyIdToken', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Token expired'));
      const provider = makeProvider();

      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
      await expect(provider.verify(makeRequest('Bearer bad-token') as never)).rejects.toThrow('Token expired');
    });

    it('uses getApp() when no app is provided', () => {
      makeProvider();
      expect(vi.mocked(getApp)).toHaveBeenCalled();
    });

    it('uses the provided app when one is given', () => {
      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
      const customApp = { name: 'custom' } as unknown as App;
      makeProvider(customApp);
      expect(vi.mocked(getAuth)).toHaveBeenCalledWith(customApp);
    });
  });
});
