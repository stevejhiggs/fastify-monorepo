# @repo/fastify-common-types

Shared TypeScript type definitions for Fastify plugins.

## Exports

```typescript
import type {
  FastifyInstanceForRegistration,
  EnhancedFastifyInstance
  // other shared types
} from '@repo/fastify-common-types';
```

## Key Types

### FastifyInstanceForRegistration

Base Fastify instance type used as input for plugin registration functions:

```typescript
function registerMyPlugin(app: FastifyInstanceForRegistration): EnhancedFastifyInstance {
  // Register plugin...
  return app as EnhancedFastifyInstance;
}
```

### EnhancedFastifyInstance

Fully configured Fastify instance with all plugins registered and Zod type provider:

```typescript
type EnhancedFastifyInstance = FastifyInstance<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, FastifyBaseLogger, ZodTypeProvider>;
```

## Purpose

Centralizes Fastify-related type definitions to:

- Avoid circular dependencies between fastify packages
- Provide consistent typing across all plugins
- Define the contract between plugin registration functions

## When to Modify

Add types here when:

- Multiple fastify-\* packages need the same type
- Defining interfaces for cross-plugin communication
- Creating base types that plugins extend

Keep domain-specific types in their respective packages.
