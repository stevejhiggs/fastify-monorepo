# @repo/fastify-swagger

OpenAPI/Swagger documentation generation for Fastify.

## Exports

```typescript
import { registerSwagger } from "@repo/fastify-swagger";
import type { SwaggerConfig } from "@repo/fastify-swagger";
```

## Usage

```typescript
import { registerSwagger } from "@repo/fastify-swagger";

const app = await registerSwagger(fastifyInstance, {
  title: "My API",
  version: "1.0.0",
  description: "API documentation",
});
```

## Configuration

```typescript
interface SwaggerConfig {
  title?: string;
  version?: string;
  description?: string;
  disabled?: boolean; // Set via DISABLE_DOCS env var
}
```

## Endpoints

When enabled:
- `/documentation` - Swagger UI
- `/documentation/json` - OpenAPI JSON spec
- `/documentation/yaml` - OpenAPI YAML spec

## Zod Integration

Works with `@repo/fastify-zod` to auto-generate schemas:

```typescript
app.get("/users", {
  schema: {
    querystring: z.object({
      limit: z.coerce.number().default(10),
    }),
    response: {
      200: z.array(userSchema),
    },
  },
  handler: async (request) => { /* ... */ },
});
// Automatically documented in Swagger UI
```

## Disabling in Production

Set `DISABLE_DOCS=true` to disable documentation endpoint:

```typescript
// Or programmatically
registerSwagger(app, { disabled: true });
```

## Adding Descriptions

Use Zod's `.describe()` for field documentation:

```typescript
const schema = z.object({
  email: z.string().email().describe("User email address"),
  age: z.number().min(0).describe("User age in years"),
});
```
