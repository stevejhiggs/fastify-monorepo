# @repo/fastify-auth-jwt

JWT authentication provider for [`@repo/fastify-auth`](../fastify-auth/README.md). Uses [`@fastify/jwt`](https://github.com/fastify/fastify-jwt) under the hood and supports symmetric secrets, asymmetric keypairs, and audience validation.

## Installation

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

### Signing tokens

Once registered, `app.jwt.sign` is available for issuing tokens:

```typescript
app.post('/login', async (request, reply) => {
  // ... validate credentials ...
  const token = app.jwt.sign({ sub: user.id, role: user.role });
  return { token };
});
```

### Audience validation

Pass an `audience` array to restrict which tokens are accepted. Tokens whose `aud` claim is not in the list — or that have no `aud` claim at all — are rejected with 401:

```typescript
await registerAuth(
  app,
  jwtProvider({
    secret: process.env.JWT_SECRET,
    audience: ['api', 'admin']
  })
);

// Only tokens signed with aud: 'api' or aud: 'admin' are accepted
app.post('/login', async (request, reply) => {
  const token = app.jwt.sign({ sub: user.id, aud: 'api' });
  return { token };
});
```

When `audience` is not set, the `aud` claim is not checked.

### Asymmetric keypair (RS256 / ES256)

```typescript
import { readFileSync } from 'node:fs';

await registerAuth(
  app,
  jwtProvider({
    privateKey: readFileSync('./keys/private.pem', 'utf8'),
    publicKey: readFileSync('./keys/public.pem', 'utf8'),
    audience: ['api']
  })
);
```

## API

### `jwtProvider(config): AuthProvider`

Returns an `AuthProvider` that can be passed to `registerAuth`.

| Config field               | Type       | Description                                                                                     |
| -------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `secret`                   | `string`   | Symmetric HMAC secret (HS256). Use for internal services.                                       |
| `publicKey` + `privateKey` | `string`   | Asymmetric keypair (RS256/ES256). Use when tokens are issued externally.                        |
| `audience`                 | `string[]` | Optional. Allowed `aud` claim values. Tokens without a matching audience are rejected with 401. |

Either `secret` or `publicKey`+`privateKey` must be provided (not both).
