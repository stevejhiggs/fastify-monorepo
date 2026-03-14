# @repo/fastify-security

Security headers via Fastify Helmet integration.

## Exports

```typescript
import { registerDefaultSecurity } from '@repo/fastify-security';
```

## Usage

```typescript
import { registerDefaultSecurity } from '@repo/fastify-security';

const app = registerDefaultSecurity(fastifyInstance);
```

## What It Does

Applies `@fastify/helmet` with secure defaults:

- Content Security Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- Strict-Transport-Security (HSTS)
- And more...

## Default Configuration

The plugin uses sensible defaults suitable for API servers. Headers are configured for HTTPS deployment.

## Customization

For custom helmet options, modify the registration in `src/index.ts`:

```typescript
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"]
      // custom directives
    }
  }
});
```

## CORS Note

This package handles security headers only. For CORS, use `@fastify/cors` separately if needed.

## Testing

Security headers may interfere with test tooling. Consider disabling in test environment if needed, but always enable in production.
