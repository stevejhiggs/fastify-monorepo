# @repo/fastify-zod

Fastify plugin for Zod schema validation and serialization. Provides type-safe request/response validation with automatic TypeScript type inference.

## Features

- **Type-Safe Validation** - Zod schemas with automatic TypeScript inference
- **Request Validation** - Validate query, params, body, and headers
- **Response Validation** - Validate response schemas
- **Swagger Integration** - Works seamlessly with `@repo/fastify-swagger`
- **Zero Runtime Overhead** - Type-only additions in production

## Installation

```bash
pnpm add @repo/fastify-zod fastify zod
```

## Usage

### Basic Setup

```typescript
import { registerZodProvider } from '@repo/fastify-zod';
import fastify from 'fastify';
import { z } from 'zod';

const app = fastify();

// Register Zod provider
const zodApp = registerZodProvider(app);

// Now you can use Zod schemas with full type safety
zodApp.get('/users/:id', {
  schema: {
    params: z.object({
      id: z.string().uuid()
    }),
    querystring: z.object({
      include: z.enum(['profile', 'settings']).optional()
    }),
    response: {
      200: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email()
      })
    }
  }
}, async (request, reply) => {
  // request.params.id is typed as string
  // request.query.include is typed as 'profile' | 'settings' | undefined
  const { id } = request.params;
  const { include } = request.query;
  
  return {
    id,
    name: 'John Doe',
    email: 'john@example.com'
  };
});
```

### Request Body Validation

```typescript
import { registerZodProvider } from '@repo/fastify-zod';
import { z } from 'zod';

const zodApp = registerZodProvider(app);

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(18).max(120)
});

zodApp.post('/users', {
  schema: {
    body: createUserSchema,
    response: {
      201: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email()
      })
    }
  }
}, async (request, reply) => {
  // request.body is fully typed based on the schema
  const { name, email, age } = request.body;
  
  const user = await createUser({ name, email, age });
  
  reply.code(201);
  return user;
});
```

### Complex Validation

```typescript
import { z } from 'zod';

zodApp.post('/users/:userId/posts', {
  schema: {
    params: z.object({
      userId: z.string().uuid()
    }),
    body: z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(10),
      tags: z.array(z.string()).max(10),
      published: z.boolean().default(false)
    }),
    headers: z.object({
      'x-request-id': z.string().uuid()
    }),
    response: {
      201: z.object({
        id: z.string().uuid(),
        title: z.string(),
        createdAt: z.string().datetime()
      })
    }
  }
}, async (request) => {
  // All types are inferred from schemas
  const { userId } = request.params;
  const { title, content, tags, published } = request.body;
  const requestId = request.headers['x-request-id'];
  
  // Your logic here
});
```

### Integration with Swagger

When used with `@repo/fastify-swagger`, Zod schemas are automatically converted to OpenAPI schemas:

```typescript
import { registerZodProvider, jsonSchemaTransform } from '@repo/fastify-zod';
import { registerSwagger } from '@repo/fastify-swagger';

const zodApp = registerZodProvider(app);

await registerSwagger(zodApp, {
  enable: true,
  title: 'My API',
  version: '1.0.0',
  port: 3000,
  transform: jsonSchemaTransform // Converts Zod to OpenAPI
});
```

## API

### `registerZodProvider(app)`

Registers Zod validators and serializers on a Fastify instance.

**Parameters:**
- `app: FastifyInstanceForRegistration` - Fastify instance to enhance

**Returns:** Fastify instance with Zod type provider

### `jsonSchemaTransform`

Transform function for converting Zod schemas to OpenAPI/JSON Schema format. Use with `@repo/fastify-swagger`.

### `ZodTypeProvider`

Type provider for Fastify that enables Zod schema validation.

## Type Safety

All request properties are automatically typed based on your Zod schemas:

```typescript
zodApp.get('/users/:id', {
  schema: {
    params: z.object({ id: z.string() }),
    querystring: z.object({ page: z.number().default(1) }),
    body: z.object({ name: z.string() })
  }
}, async (request) => {
  // TypeScript knows the exact types:
  // request.params.id: string
  // request.query.page: number
  // request.body.name: string
});
```

## Error Handling

Invalid requests automatically return 400 errors with validation details:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error",
  "details": [
    {
      "path": ["body", "email"],
      "message": "Invalid email"
    }
  ]
}
```

## Testing

```bash
pnpm typecheck
```

## License

ISC
