# @repo/fastify-security

Fastify plugin for security headers using Helmet. Provides essential security headers to protect your API from common vulnerabilities.

## Features

- **Helmet Integration** - Industry-standard security headers
- **Zero Configuration** - Works out of the box with sensible defaults
- **Production Ready** - Battle-tested security headers
- **Fast** - Minimal overhead

## Installation

```bash
pnpm add @repo/fastify-security fastify
```

## Usage

### Basic Setup

```typescript
import { registerDefaultSecurity } from '@repo/fastify-security';
import fastify from 'fastify';

const app = fastify();

// Register security headers
await registerDefaultSecurity(app);

// Your routes here
app.get('/users', async () => {
  return { users: [] };
});

await app.listen({ port: 3000 });
```

## Security Headers Included

Helmet sets the following HTTP headers by default:

- **Content-Security-Policy** - Helps prevent XSS attacks
- **X-DNS-Prefetch-Control** - Controls DNS prefetching
- **X-Frame-Options** - Prevents clickjacking
- **X-Content-Type-Options** - Prevents MIME type sniffing
- **X-XSS-Protection** - Legacy XSS protection
- **Strict-Transport-Security** - Enforces HTTPS
- **Referrer-Policy** - Controls referrer information

## API

### `registerDefaultSecurity(app)`

Registers Helmet with default security settings on a Fastify instance.

**Parameters:**
- `app: FastifyInstanceForRegistration` - Fastify instance

**Returns:** `Promise<void>`

## Custom Configuration

If you need custom Helmet configuration, you can use Helmet directly:

```typescript
import helmet from '@fastify/helmet';

await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
});
```

## Example: Complete Setup

```typescript
import fastify from 'fastify';
import { registerDefaultSecurity } from '@repo/fastify-security';

const app = fastify();

// Register security headers
await registerDefaultSecurity(app);

app.get('/api/users', async (request, reply) => {
  // All responses will include security headers
  return { users: [] };
});

await app.listen({ port: 3000 });
```

## Testing

```bash
pnpm typecheck
```

## License

ISC
