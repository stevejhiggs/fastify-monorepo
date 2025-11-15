# @repo/fastify-swagger

Fastify plugin for automatic OpenAPI/Swagger documentation generation. Provides interactive API documentation at a configurable route.

## Features

- **Automatic Documentation** - Generates OpenAPI 3.1.0 specs from your routes
- **Interactive UI** - Swagger UI for exploring and testing your API
- **Schema Integration** - Works with Zod schemas via `@repo/fastify-zod`
- **Customizable** - Configurable title, version, and route prefix
- **Production Ready** - Can be disabled in production environments

## Installation

```bash
pnpm add @repo/fastify-swagger fastify
```

## Usage

### Basic Setup

```typescript
import { registerSwagger } from '@repo/fastify-swagger';
import fastify from 'fastify';

const app = fastify();

await registerSwagger(app, {
  enable: true,
  title: 'My API',
  version: '1.0.0',
  port: 3000
});

// Your routes here
app.get('/users', async () => {
  return { users: [] };
});

await app.listen({ port: 3000 });
// Documentation available at http://localhost:3000/documentation
```

### With Zod Schemas

When used with `@repo/fastify-zod`, schemas are automatically converted to OpenAPI:

```typescript
import { registerSwagger } from '@repo/fastify-swagger';
import { registerZodProvider, jsonSchemaTransform } from '@repo/fastify-zod';
import { z } from 'zod';

const zodApp = registerZodProvider(app);

await registerSwagger(zodApp, {
  enable: true,
  title: 'User API',
  version: '1.0.0',
  port: 3000,
  transform: jsonSchemaTransform // Converts Zod to OpenAPI
});

zodApp.get('/users/:id', {
  schema: {
    params: z.object({
      id: z.string().uuid()
    }),
    response: {
      200: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email()
      })
    }
  }
}, async (request) => {
  return { id: request.params.id, name: 'John', email: 'john@example.com' };
});
```

### Custom Configuration

```typescript
await registerSwagger(app, {
  enable: process.env.NODE_ENV !== 'production',
  title: 'My Awesome API',
  version: '2.0.0',
  port: 3000,
  host: 'api.example.com',
  documentationRoute: '/api-docs', // Custom route instead of /documentation
  transform: jsonSchemaTransform
});
```

### Environment-Based Setup

```typescript
await registerSwagger(app, {
  enable: process.env.DISABLE_DOCS !== 'true',
  title: process.env.API_TITLE || 'API',
  version: process.env.API_VERSION || '1.0.0',
  port: Number(process.env.PORT) || 3000
});
```

## API

### `registerSwagger(app, config)`

Registers Swagger/OpenAPI documentation on a Fastify instance.

**Parameters:**
- `app: FastifyInstanceForRegistration` - Fastify instance
- `config: SwaggerConfig` - Configuration object

**Config Options:**
```typescript
type SwaggerConfig = {
  enable: boolean;                    // Enable/disable documentation
  title?: string;                      // API title (default: 'API')
  version?: string;                    // API version (default: '1.0.0')
  port: number;                        // Server port
  host?: string;                       // Server host (default: 'localhost')
  documentationRoute?: string;        // Route prefix (default: '/documentation')
  transform?: SwaggerTransform;        // Schema transform function
};
```

## Documentation Routes

After registration, the following routes are available:

- `GET /documentation` - Interactive Swagger UI
- `GET /documentation/json` - OpenAPI JSON specification
- `GET /documentation/yaml` - OpenAPI YAML specification

```typescript
import fastify from 'fastify';
import { registerSwagger } from '@repo/fastify-swagger';
import { registerZodProvider, jsonSchemaTransform } from '@repo/fastify-zod';
import { z } from 'zod';

const app = fastify();
const zodApp = registerZodProvider(app);

// Register Swagger
await registerSwagger(zodApp, {
  enable: true,
  title: 'User Management API',
  version: '1.0.0',
  port: 3000,
  transform: jsonSchemaTransform
});

// Define routes with schemas
zodApp.post('/users', {
  schema: {
    body: z.object({
      name: z.string().min(1),
      email: z.string().email()
    }),
    response: {
      201: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email()
      })
    }
  }
}, async (request, reply) => {
  const user = await createUser(request.body);
  reply.code(201);
  return user;
});

zodApp.get('/users/:id', {
  schema: {
    params: z.object({
      id: z.string().uuid()
    }),
    response: {
      200: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email()
      })
    }
  }
}, async (request) => {
  return await getUserById(request.params.id);
});

await app.listen({ port: 3000 });
```

## Security Considerations

In production, consider disabling documentation:

```typescript
await registerSwagger(app, {
  enable: process.env.NODE_ENV !== 'production',
  // ... other config
});
```

## Testing

```bash
pnpm typecheck
```

## License

ISC
