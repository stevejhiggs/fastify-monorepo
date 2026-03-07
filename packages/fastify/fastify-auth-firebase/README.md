# @repo/fastify-auth-firebase

Firebase Authentication provider for [`@repo/fastify-auth`](../fastify-auth/README.md) with multi-tenant support.

Uses the Firebase Admin SDK to verify ID tokens per-tenant, with session revocation checking enabled.

## Installation

```json
{
  "dependencies": {
    "@repo/fastify-auth": "workspace:*",
    "@repo/fastify-auth-firebase": "workspace:*"
  }
}
```

Your app must also have `firebase-admin` installed and initialised before calling `registerAuth`.

## Usage

### Setup

Initialise the Firebase Admin SDK once in your app, then pass `firebaseProvider` to `registerAuth`:

```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { registerAuth } from '@repo/fastify-auth';
import { firebaseProvider } from '@repo/fastify-auth-firebase';

const firebaseApp = initializeApp({ credential: cert('./service-account.json') });

await registerAuth(
  app,
  firebaseProvider({
    tenantId: process.env.FIREBASE_TENANT_ID,
    app: firebaseApp
  })
);
```

If you only have one Firebase app (the default), you can omit `app`:

```typescript
initializeApp({ credential: cert('./service-account.json') });

await registerAuth(
  app,
  firebaseProvider({
    tenantId: process.env.FIREBASE_TENANT_ID
  })
);
```

### Using the decorators

Once registered, use `app.authenticate`, `app.populateUser`, and `app.requireUser` exactly as documented in [`@repo/fastify-auth`](../fastify-auth/README.md):

```typescript
// Required auth
app.get('/me', { preHandler: [app.authenticate] }, async (request) => {
  return request.user; // { sub: uid, email, ...other claims }
});

// Optional auth — global hook pattern
app.addHook('onRequest', app.populateUser);

app.get('/posts', async (request) => {
  if (request.user) {
    // personalised response
  }
  // public response
});

app.delete('/posts/:id', { preHandler: [app.requireUser] }, async (request) => {
  await deletePost(request.params.id, request.user.sub);
  return { success: true };
});
```

## API

### `firebaseProvider(config): AuthProvider`

| Config field | Type     | Required | Description                                                     |
| ------------ | -------- | -------- | --------------------------------------------------------------- |
| `tenantId`   | `string` | Yes      | Firebase tenant ID                                              |
| `app`        | `App`    | No       | Firebase Admin `App` instance. Uses the default app if omitted. |

The returned provider:

- Verifies tokens via `tenantManager().authForTenant(tenantId).verifyIdToken(token, true)`
- The `true` flag enables revocation checking — revoked tokens are rejected
- Maps `decoded.uid` → `sub` on `request.user`, and includes all other claims

### Token payload

`request.user` contains `sub` (mapped from Firebase `uid`) plus any other claims present in the token:

```typescript
// Example request.user after successful verification
{
  sub: 'firebase-uid-abc123',
  email: 'user@example.com',
  firebase: { tenant: 'my-tenant', sign_in_provider: 'password' },
  // ...any custom claims
}
```
