# @repo/config

Strongly typed, Zod-validated configuration. Define a schema, pass values, get a validated and frozen config object — or a `ConfigError` if anything is wrong.

## Installation

```json
{
  "dependencies": {
    "@repo/config": "workspace:*"
  },
  "peerDependencies": {
    "zod": "catalog:"
  }
}
```

## Usage

```typescript
import { createConfig } from '@repo/config';
import { z } from 'zod';

const dbConfig = createConfig(
  z.object({
    host: z.string(),
    port: z.number().default(5432),
    ssl: z.boolean().default(false)
  }),
  { host: 'localhost' }
);

dbConfig.host; // 'localhost'
dbConfig.port; // 5432 (default applied)
dbConfig.ssl; // false (default applied)
```

### Missing or invalid values throw

Invalid configuration throws a `ConfigError` with the underlying `ZodError` as its `cause`.

```typescript
import { ConfigError, createConfig } from '@repo/config';

try {
  createConfig(z.object({ host: z.string(), port: z.number() }), { host: 'localhost' });
} catch (error) {
  if (error instanceof ConfigError) {
    console.error(error.message); // "Invalid configuration: ..."
    console.error(error.cause); // ZodError with detailed field errors
  }
}
```

### Works with any Zod features

Coercion, transforms, refinements, and nested schemas all work since `createConfig` delegates to `schema.parse()`.

```typescript
const config = createConfig(
  z.object({
    port: z.coerce.number(),
    origins: z.string().array().default([]),
    redis: z.object({
      url: z.string().url(),
      ttl: z.number().positive()
    })
  }),
  {
    port: '3000',
    redis: { url: 'redis://localhost:6379', ttl: 300 }
  }
);
```

## API

### `createConfig(schema, values)`

Parses `values` against the Zod `schema` and returns a frozen, readonly object.

- **`schema`** — Any Zod schema (`z.ZodType`)
- **`values`** — The raw values to validate (`unknown`)
- **Returns** — `Readonly<z.output<T>>` — parsed, typed, and frozen
- **Throws** — `ConfigError` if validation fails (with `ZodError` as `cause`)

## Testing

```bash
pnpm --filter @repo/config test
```
