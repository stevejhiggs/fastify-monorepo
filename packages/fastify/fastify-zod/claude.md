# @repo/fastify-zod

Zod type provider integration for Fastify.

## Exports

```typescript
import { registerZod, jsonSchemaTransform } from '@repo/fastify-zod';
```

## Usage

```typescript
import Fastify from 'fastify';
import { registerZod } from '@repo/fastify-zod';

const app = registerZod(Fastify());

// Now routes are type-safe with Zod schemas
app.get('/users/:id', {
  schema: {
    params: z.object({ id: z.string().uuid() }),
    response: {
      200: z.object({
        id: z.string(),
        name: z.string()
      })
    }
  },
  handler: async (request) => {
    const { id } = request.params; // typed as string
    return { id, name: 'John' };
  }
});
```

## Schema Transform

`jsonSchemaTransform` converts Zod schemas to JSON Schema for Swagger:

```typescript
import { jsonSchemaTransform } from '@repo/fastify-zod';

// Used internally by fastify-swagger
```

## Type Provider Pattern

After registration, the Fastify instance uses `ZodTypeProvider`:

- Request body, query, params, headers are validated and typed
- Response schemas validate outgoing data
- TypeScript infers types from Zod schemas automatically

## Validation Errors

Invalid requests return 400 with structured error:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "issues": [{ "path": ["body", "email"], "message": "Invalid email" }]
}
```

## Best Practices

- Define schemas outside route for reuse
- Use `z.coerce` for query params: `z.coerce.number()`
- Export schemas for client-side validation
