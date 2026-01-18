# @repo/typescript-utils

Shared TypeScript utility types used across the monorepo.

## Exports

```typescript
import type { /* utility types */ } from "@repo/typescript-utils/types";
```

## Purpose

Central location for reusable TypeScript utility types that don't belong to any specific domain package.

## Adding Types

When adding new utility types:

1. Add to `src/types.ts`
2. Export from the subpath export
3. Keep types generic and reusable
4. Document with JSDoc comments

## Guidelines

- Only add types used by multiple packages
- Prefer built-in TypeScript utilities when possible
- No runtime code - types only
- Use descriptive names that indicate purpose
