# @repo/fastify-auth

Provider-agnostic authentication plugin for Fastify. Provides composable preHandler decorators (`populateUser`, `requireUser`, `authenticate`) that work with any auth provider.

For JWT authentication, pair with [`@repo/fastify-auth-jwt`](../fastify-auth-jwt/README.md).

## Installation

This package is part of the monorepo. Add it as a workspace dependency:

```json
{
  "dependencies": {
    "@repo/fastify-auth": "workspace:*",
    "@repo/fastify-auth-jwt": "workspace:*"
  }
}
```

## Usage

### Setup

```typescript
import { registerAuth } from '@repo/fastify-auth';
import { jwtProvider } from '@repo/fastify-auth-jwt';

await registerAuth(app, jwtProvider({ secret: process.env.JWT_SECRET }));
```

### Required authentication

Use `app.authenticate` as a preHandler — returns 401 if no valid token:

```typescript
app.get('/me', { preHandler: [app.authenticate] }, async (request) => {
  return request.user; // JwtPayload, guaranteed set
});
```

### Optional authentication

Use `app.populateUser` to populate `request.user` if a token is present, but continue without error if it isn't:

```typescript
app.get('/feed', { preHandler: [app.populateUser] }, async (request) => {
  if (request.user) {
    // personalized response
  }
  // public response
});
```

### Apply globally

The recommended pattern for most apps: register `populateUser` once as a global hook, then use `requireUser` only on routes that need it. This way `request.user` is always available without per-route boilerplate.

```typescript
import { registerAuth } from '@repo/fastify-auth';
import { jwtProvider } from '@repo/fastify-auth-jwt';

await registerAuth(app, jwtProvider({ secret: process.env.JWT_SECRET }));

// Run on every request — sets request.user if a valid token is present.
// Routes with no token simply get request.user = undefined.
app.addHook('onRequest', app.populateUser);

// Public route — no auth required, but still gets user context if a token is sent
app.get('/posts', async (request) => {
  const posts = await getPosts();
  if (request.user) {
    return posts.map((p) => ({ ...p, liked: isLikedBy(p, request.user.sub) }));
  }
  return posts;
});

// Protected route — requireUser returns 401 if request.user was not populated
app.get('/me', { preHandler: [app.requireUser] }, async (request) => {
  return request.user; // guaranteed to be set here
});

app.delete('/posts/:id', { preHandler: [app.requireUser] }, async (request) => {
  await deletePost(request.params.id, request.user.sub);
  return { success: true };
});
```

### Custom providers

For Firebase Authentication with multi-tenant support, use [`@repo/fastify-auth-firebase`](../fastify-auth-firebase/README.md).

For other providers, implement the `AuthProvider` interface directly — see the [AuthProvider interface](#authprovider-interface) section below.

### Extending JwtPayload

```typescript
import '@repo/fastify-auth';

declare module '@repo/fastify-auth' {
  interface JwtPayload {
    role: 'admin' | 'user';
    orgId: string;
  }
}
```

## API

### `registerAuth(app, provider): Promise<void>`

Registers the auth decorators using the given provider.

| Parameter  | Type              | Description                                   |
| ---------- | ----------------- | --------------------------------------------- |
| `app`      | `FastifyInstance` | The Fastify instance to decorate              |
| `provider` | `AuthProvider`    | An auth provider (e.g. `jwtProvider(config)`) |

### `AuthProvider` interface

```typescript
interface AuthProvider {
  setup?(app: FastifyInstance): Promise<void>;
  verify(request: FastifyRequest): Promise<JwtPayload | undefined>;
}
```

- `setup` — optional. Called once during `registerAuth` to initialise the provider (e.g. register plugins).
- `verify` — called on every request in `populateUser`:
  - Returns `JwtPayload` → user is set on `request.user`
  - Returns `undefined` → no credentials present, continues silently
  - Throws → invalid credentials, becomes 401

### `app.populateUser`

Prehandler. If credentials are present:

- Valid → sets `request.user`, continues
- Invalid/expired → returns 401

If no credentials → continues, `request.user` remains `undefined`.

### `app.requireUser`

Prehandler. Returns 401 if `request.user` is not set.

### `app.authenticate`

Convenience shorthand for `[app.populateUser, app.requireUser]`.

### `request.user`

Type: `JwtPayload | undefined`. Set by `populateUser` or `authenticate`.

### `JwtPayload`

```typescript
interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}
```
