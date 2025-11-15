# @repo/fastify-common-types

Shared TypeScript types for Fastify plugins in the monorepo. Provides common type definitions used across all Fastify packages.

## Purpose

This package provides a common type definition (`FastifyInstanceForRegistration`) that allows Fastify plugins to be registered without strict type constraints. This is useful when creating plugins that need to work with any Fastify instance, regardless of its specific type parameters.

## Installation

```bash
pnpm add @repo/fastify-common-types
```

## Usage

This package is primarily used internally by other Fastify packages. If you're building a custom Fastify plugin, you can use it like this:

```typescript
import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';

export async function registerMyPlugin(app: FastifyInstanceForRegistration) {
  // Register your plugin without worrying about specific Fastify type parameters
  await app.register(someOtherPlugin);
}
```

## API

### `FastifyInstanceForRegistration`

A type alias for a `FastifyInstance` with relaxed type constraints, allowing plugin registration without strict type checking.

```typescript
type FastifyInstanceForRegistration = FastifyInstance<any, any, any, any, any>;
```

## When to Use

Use this type when:

- Building reusable Fastify plugins
- You need to register plugins without strict type constraints
- Creating plugin registration functions that work with any Fastify instance

## Example

```typescript
import type { FastifyInstanceForRegistration } from '@repo/fastify-common-types';
import fastifyHelmet from '@fastify/helmet';

export async function registerSecurity(app: FastifyInstanceForRegistration) {
  await app.register(fastifyHelmet);
}
```

## Testing

```bash
pnpm typecheck
```

## License

ISC
